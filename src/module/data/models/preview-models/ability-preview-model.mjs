import { objectMap } from "../../../helpers/utils.mjs";
import { TernaryField } from "../../fields/_module.mjs";
import { blockGaplessField, blockSizeField, nullString } from "../../fields/helpers/builders.mjs";
import MetaphysicsPreviewModel from "./metaphysics-preview-model.mjs";

const { fields } = foundry.data;

/**
 * @typedef {object} CostFilters
 * @property {Record<Teriock.Keys.PrimaryCost, boolean|null>} primary
 * @property {Record<Teriock.Keys.Component, boolean|null>} components
 * @property {Record<Teriock.Keys.CostTweak, boolean|null>} tweaks
 */

/**
 * @typedef {MetaphysicsFilters} AbilityFilters
 * @property {CostFilters} costs
 * @property {Teriock.Keys.Delivery|null} delivery
 * @property {Teriock.Keys.Expansion|null} expansion
 * @property {Teriock.Keys.Interaction|null} interaction
 * @property {Teriock.Keys.Maneuver|null} maneuver
 * @property {Teriock.Keys.Target|null} target
 * @property {boolean|null} basic
 * @property {boolean|null} heightened
 * @property {boolean|null} invoked
 * @property {boolean|null} ritual
 * @property {boolean|null} rotator
 * @property {boolean|null} skill
 * @property {boolean|null} spell
 * @property {boolean|null} standard
 * @property {boolean|null} sustained
 */

/**
 * @property {AbilityFilters} filters
 */
export default class AbilityPreviewModel extends MetaphysicsPreviewModel {
  /** @inheritDoc */
  static get defaultSortOption() {
    return "name";
  }

  /** @inheritDoc */
  static get sortOrders() {
    return TERIOCK.config.display.abilitySortOrders;
  }

  /** @inheritDoc */
  static defineDisplay() {
    return { gapless: blockGaplessField({ initial: true }), size: blockSizeField({ initial: "small" }) };
  }

  /** @inheritDoc */
  static defineFilters() {
    return Object.assign(super.defineFilters(), {
      basic: new TernaryField({ label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.basic.label") }),
      costs: new fields.SchemaField({
        components: new fields.SchemaField(objectMap(TERIOCK.config.cost.components.keys, (c) =>
          new TernaryField({ label: _loc("TERIOCK.COSTS.Long.component", { key: _loc(c) }) }))),
        primary: new fields.SchemaField(objectMap(TERIOCK.config.cost.primary.keys, (c) =>
          new TernaryField({ label: _loc("TERIOCK.COSTS.Long.primary", { key: _loc(c.label) }) }))),
        tweaks: new fields.SchemaField(objectMap(TERIOCK.config.cost.tweaks, (c) =>
          new TernaryField({ label: _loc(c.label) }))),
      }),
      delivery: nullString({
        choices: TERIOCK.config.ability.delivery,
        label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.delivery.label"),
      }),
      expansion: nullString({
        choices: TERIOCK.config.ability.expansion,
        label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.expansion.label"),
      }),
      heightened: new TernaryField({ label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.heightened.label") }),
      interaction: nullString({
        choices: TERIOCK.config.ability.interaction,
        label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.interaction.label"),
      }),
      invoked: new TernaryField({ label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.invoked.label") }),
      maneuver: nullString({
        choices: TERIOCK.config.ability.maneuver,
        label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.maneuver.label"),
      }),
      ritual: new TernaryField({ label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.ritual.label") }),
      rotator: new TernaryField({ label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.rotator.label") }),
      skill: new TernaryField({ label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.skill.label") }),
      spell: new TernaryField({ label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.spell.label") }),
      standard: new TernaryField({ label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.standard.label") }),
      sustained: new TernaryField({ label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.sustained.label") }),
      target: nullString({
        choices: TERIOCK.config.ability.targets,
        label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.targets.label"),
      }),
    });
  }

  /**
   * Whether an ability passes the cost, component, and tweak filters.
   * @param {TeriockAbility} document
   * @returns {boolean}
   */
  #checkCostFilters(document) {
    const costs = document.system.costs;
    const filters = this.filters.costs;
    for (const key of Object.keys(filters.primary)) {
      if (!this._checkTernaryFilter(filters.primary[key], costs?.primary?.[key]?.type)) { return false; }
    }
    for (const key of Object.keys(filters.components)) {
      if (!this._checkTernaryFilter(filters.components[key], costs?.components?.[key]?.type)) { return false; }
    }
    for (const key of Object.keys(filters.tweaks)) {
      if (!this._checkTernaryFilter(filters.tweaks[key], costs?.tweaks?.[key])) { return false; }
    }
    return true;
  }

  /** @inheritDoc */
  get _formPathsSelect() {
    return [
      ...super._formPathsSelect,
      "filters.interaction",
      "filters.maneuver",
      "filters.delivery",
      "filters.expansion",
      "filters.target",
    ];
  }

  /** @inheritDoc */
  get _formPathsTernary() {
    return [
      ...super._formPathsTernary,
      "filters.basic",
      "filters.standard",
      "filters.spell",
      "filters.skill",
      "filters.ritual",
      "filters.rotator",
      "filters.sustained",
      "filters.invoked",
      "filters.heightened",
      ...this._formPathsTernaryCosts,
    ];
  }

  /**
   * Cost ternary form paths.
   * @returns {string[]}
   */
  get _formPathsTernaryCosts() {
    return [
      ...Object.keys(TERIOCK.config.cost.primary.keys).map((k) => `filters.costs.primary.${k}`),
      ...Object.keys(TERIOCK.config.cost.components.keys).map((k) => `filters.costs.components.${k}`),
      ...Object.keys(TERIOCK.config.cost.tweaks).map((k) => `filters.costs.tweaks.${k}`),
    ];
  }

  /** @inheritDoc */
  get _sortMap() {
    return {
      enabled: a => Number(a.disabled),
      name: a => a.name,
      sourceName: a => a.parent?.name ?? "",
      sourceType: a => a.parent?.type ?? "",
      type: a => a.system.form ?? "",
    };
  }

  /**
   * @inheritDoc
   * @param {TeriockAbility[]} documents
   * @returns {Generator<TeriockAbility, void, void>}
   */
  *filterDocuments(documents) {
    for (const document of super.filterDocuments(documents)) {
      if (
        this._checkTernaryFilter(this.filters.basic, document.system.basic)
        && this._checkTernaryFilter(this.filters.heightened, document.system.heightened)
        && this._checkTernaryFilter(this.filters.invoked, document.system.invoked)
        && this._checkTernaryFilter(this.filters.ritual, document.system.ritual)
        && this._checkTernaryFilter(this.filters.rotator, document.system.rotator)
        && this._checkTernaryFilter(this.filters.skill, document.system.skill)
        && this._checkTernaryFilter(this.filters.spell, document.system.spell)
        && this._checkTernaryFilter(this.filters.standard, document.system.standard)
        && this._checkTernaryFilter(this.filters.sustained, document.system.sustained)
        && this._checkValueFilter(this.filters.delivery, document.system.delivery)
        && this._checkValueFilter(this.filters.expansion, document.system.expansion.type)
        && this._checkValueFilter(this.filters.interaction, document.system.interaction)
        && this._checkValueFilter(this.filters.maneuver, document.system.maneuver)
        && this._checkValueFilter(this.filters.target, document.system.targets)
        && this.#checkCostFilters(document)
      ) {
        yield document;
      }
    }
  }
}
