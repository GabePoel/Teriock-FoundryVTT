import documentConfig from "../../../../constants/config/document-config.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { dotJoin } from "../../../../helpers/string.mjs";
import { getName } from "../../../../helpers/utils.mjs";
import { CompetenceModel } from "../../../models/_module.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
import BaseItemSystem from "../base-item-system/base-item-system.mjs";

const { fields } = foundry.data;

/**
 * Archetype-specific item data model.
 * @extends {BaseItemSystem}
 * @extends {Teriock.Models.ArchetypeSystemData}
 * @mixes CompetenceDisplaySystem
 */
export default class ArchetypeSystem extends mixClasses(BaseItemSystem, systemMixins.CompetenceDisplaySystemMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Archetype"];

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { type: "archetype" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      competence: new fields.EmbeddedDataField(CompetenceModel, { initial: { raw: 1 } }),
    });
  }

  /**
   * If this is suppressed due to worn armor exceeding maximum AV.
   * @returns {boolean}
   */
  get _isSuppressedArmor() {
    return Boolean(
      game.teriock.getSetting("armorSuppressesRanks")
        && this.actor
        && !this.innate
        && this.actor.system.defense.av.base > this.maxAv,
    );
  }

  /**
   * If this is suppressed due to having no active ranks.
   * @returns {boolean}
   */
  get _isSuppressedInactiveRanks() {
    return Boolean(this.actor && this.ranks.filter(r => r.active).length === 0);
  }

  /** @inheritDoc */
  get _panelBars() {
    return [{ icon: documentConfig.rank.icon, label: documentConfig.rank.plural, wrappers: this.classNames }];
  }

  /**
   * The identifiers for the classes that provide this.
   */
  get classIdentifiers() {
    return new Set(
      this.actor?.ranks.filter(r => r.system._source.archetype === this.identifier).map(r => r.system.class),
    );
  }

  /**
   * The localized names of all the classes that provide this.
   * @returns {string[]}
   */
  get classNames() {
    return Array.from(this.classIdentifiers, id => getName("class", id)).sort((a, b) => a.localeCompare(b));
  }

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, { text: dotJoin(this.classNames) });
  }

  /** @inheritDoc */
  get makeSuppressed() {
    return super.makeSuppressed || this._isSuppressedArmor || this._isSuppressedInactiveRanks;
  }

  /**
   * The ranks that provide this.
   * @returns {TeriockRank[]}
   */
  get ranks() {
    if (!this.actor) { return []; }
    return this.actor.ranks.filter(r => r.system._source.archetype === this.identifier);
  }

  /** @inheritDoc */
  _collectSuppressionMessages() {
    super._collectSuppressionMessages();
    if (this._isSuppressedArmor) { this._addSuppressionMessage("armor"); }
    if (this._isSuppressedInactiveRanks) { this._addSuppressionMessage("inactiveRanks"); }
  }

  /**
   * Derive a competence value.
   * @returns {Teriock.System.CompetenceLevel}
   */
  deriveCompetence() {
    const activeRanks = this.ranks.filter(r => r.active);
    if (activeRanks.length === 0) { return 0; }
    return Math.max(...activeRanks.map(r => r.system.competence.value));
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.competence.raw = this.deriveCompetence();
  }
}
