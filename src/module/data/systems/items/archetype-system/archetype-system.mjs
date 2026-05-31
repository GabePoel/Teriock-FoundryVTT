import documentConfig from "../../../../constants/config/document-config.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { dotJoin, toCamelCase, toTitleCase } from "../../../../helpers/string.mjs";
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
   * The localized names of all the classes that provide this.
   * @returns {string[]}
   */
  get classNames() {
    return Array.from(
      new Set(
        this.actor?.ranks.filter(r => r.system._source.archetype === this.identifier).map(r =>
          TERIOCK.reference.classes[toCamelCase(r.system._source.class)] ?? toTitleCase(r.system._source.class)
        ),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, { text: dotJoin(this.classNames) });
  }

  /** @inheritDoc */
  get makeSuppressed() {
    let suppressed = super.makeSuppressed;
    if (
      game.teriock.getSetting("armorSuppressesRanks")
      && this.actor
      && !this.innate
      && this.actor.system.defense.av.base > this.maxAv
    ) {
      suppressed = true;
    }
    if (this.actor && this.ranks.filter(r => r.active).length === 0) { suppressed = true; }
    return suppressed;
  }

  /** @inheritDoc */
  get messageBars() {
    return [{ icon: documentConfig.rank.icon, label: documentConfig.rank.plural, wrappers: this.classNames }];
  }

  /**
   * The ranks that provide this.
   * @returns {TeriockRank[]}
   */
  get ranks() {
    if (!this.actor) { return []; }
    return this.actor.ranks.filter(r => r.system._source.archetype === this.identifier);
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
