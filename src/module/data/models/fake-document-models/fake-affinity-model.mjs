import affinityConfig from "../../../constants/config/affinity-config.mjs";
import { dotJoin, toId } from "../../../helpers/string.mjs";
import { competenceField } from "../../fields/tools/builders.mjs";
import BaseFakeDocumentModel from "./base-fake-document-model.mjs";

const { fields } = foundry.data;

/**
 * A single affinity an actor has, consolidated from every source that grants it. These are derived during preparation
 * and never stored to the database.
 * @extends {BaseFakeDocumentModel}
 * @property {number} amount
 * @property {Teriock.Keys.AffinityCategory} category
 * @property {Teriock.System.CompetenceLevel} competence
 * @property {Teriock.Affinities.Type} type
 * @property {string} value
 */
export default class FakeAffinityModel extends BaseFakeDocumentModel {
  /** @inheritDoc */
  static get FAKE_NAME() {
    return "Affinity";
  }

  /**
   * A key that is identical across every affinity of the same type against the same thing, so that affinities from more
   * than one source consolidate into a single entry.
   * @param {Teriock.Affinities.Type} type
   * @param {Teriock.Keys.AffinityCategory} category
   * @param {string} value
   * @returns {ID<FakeAffinityModel>}
   */
  static affinityId(type, category, value) {
    return toId([type, category, value].join("."), { hash: true });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      amount: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
      category: new fields.StringField({ required: true }),
      competence: competenceField(),
      type: new fields.StringField({ required: true }),
      value: new fields.StringField({ required: true }),
    });
  }

  /**
   * Configuration for this affinity's category.
   * @returns {object}
   */
  get _categoryConfig() {
    return affinityConfig.categories[this.category] || {};
  }

  /**
   * Configuration for this affinity's type.
   * @returns {object}
   */
  get _config() {
    return affinityConfig.types[this.type] || {};
  }

  /**
   * Only affinities that are rolled care what competence they apply at.
   * @inheritDoc
   */
  get _embedIcons() {
    if (!this._config.competence) { return [...super._embedIcons]; }
    const level = TERIOCK.config.competence.levels[this.competence] ?? {};
    return [{ icon: level.icon, tooltip: level.label }, ...super._embedIcons];
  }

  /**
   * The label for the kind of thing this affinity is against.
   * @returns {string}
   */
  get categoryLabel() {
    return _loc(this._categoryConfig.label ?? "");
  }

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, {
      action: "rollAffinity",
      color: this._config.color,
      makeTooltip: true,
      tooltipIdentifier: this._config.identifier,
      usable: true,
    });
  }

  /** @inheritDoc */
  get id() {
    return this.constructor.affinityId(this.type, this.category, this.value);
  }

  /** @inheritDoc */
  get identifier() {
    return this._config.identifier;
  }

  /**
   * The name of the thing this affinity is against.
   * @inheritDoc
   */
  get name() {
    if (this.category === "other") { return this.value; }
    const choices = foundry.utils.getProperty(TERIOCK, this._categoryConfig.choices || {}) || {};
    return choices[this.value] || this.value;
  }

  /**
   * Whether this affinity stops or lessens something, rather than making it worse.
   * @returns {boolean}
   */
  get protection() {
    return Boolean(this._config.protection);
  }

  /** @inheritDoc */
  get subtitle() {
    return dotJoin([this.typeLabel, this.categoryLabel]);
  }

  /**
   * The label for this kind of affinity, annotated with its amount when it stacks.
   * @returns {string}
   */
  get typeLabel() {
    const label = _loc(this._config.label ?? "");
    if (!this._config.stacking) { return label; }
    return _loc("TERIOCK.SHEETS.Actor.TABS.Affinities.stackingLabel", { amount: this.amount, label });
  }

  /**
   * Whether this affinity is a weakness.
   * @returns {boolean}
   */
  get weakness() {
    return Boolean(this._config.weakness);
  }
}
