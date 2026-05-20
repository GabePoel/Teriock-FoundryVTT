import { icons } from "../../../../constants/display/icons.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { IdentifierField } from "../../../fields/_module.mjs";
import { CompetenceModel } from "../../../models/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseItemSystem from "../base-item-system/base-item-system.mjs";

const { fields } = foundry.data;

/**
 * Rank-specific item data model.
 *
 * Relevant wiki pages:
 * - [Classes](https://wiki.teriock.com/index.php/Category:Classes)
 *
 * @extends {BaseItemSystem}
 * @extends {CommonSystem}
 * @extends {Teriock.Models.RankSystemData}
 * @mixes CompetenceDisplaySystem
 * @mixes StatGiverSystem
 * @mixes WikiSystem
 */
export default class RankSystem extends mixClasses(
  BaseItemSystem,
  mixins.CompetenceDisplaySystemMixin,
  mixins.WikiSystemMixin,
  mixins.StatGiverSystemMixin,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Rank"];

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      indexCategoryKey: "classes",
      indexCompendiumKey: "classes",
      namespace: "Class",
      pageNameKey: "system.className",
      type: "rank",
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      archetype: new IdentifierField({ initial: "everyman" }),
      className: new fields.StringField({ initial: "journeyman" }),
      classRank: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      competence: new fields.EmbeddedDataField(CompetenceModel, {
        initial: { raw: 1 },
      }),
      description: new fields.HTMLField({
        initial: _loc("TERIOCK.SYSTEMS.Rank.FIELDS.description.initial"),
      }),
      innate: new fields.BooleanField({ initial: false }),
      maxAv: new fields.NumberField({ initial: 2, integer: true, min: 0 }),
    });
  }

  /** @inheritDoc */
  get _canToggleHpDice() {
    return super._canToggleHpDice && !this.innate;
  }

  /** @inheritDoc */
  get _canToggleMpDice() {
    return super._canToggleMpDice && !this.innate;
  }

  /** @inheritDoc */
  get color() {
    if (this.innate) {
      return TERIOCK.display.colors.purple;
    } else {
      return TERIOCK.display.colors.grey;
    }
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = TERIOCK.config.rank[this.archetype].name;
    parts.text =
      parts.text || (this.innate ? _loc("TERIOCK.TERMS.PowerType.innate") : _loc("TERIOCK.TERMS.PowerType.learned"));
    return parts;
  }

  /** @inheritDoc */
  get isOnWiki() {
    return this.classRank > 0 && this.classRank <= 5;
  }

  /** @inheritDoc */
  get makeSuppressed() {
    let suppressed = super.makeSuppressed;
    if (
      game.teriock.getSetting("armorSuppressesRanks") &&
      this.actor &&
      !this.innate &&
      this.actor.system.defense.av.base > this.maxAv
    ) {
      suppressed = true;
    }
    return suppressed;
  }

  /** @inheritDoc */
  get messageBars() {
    return [
      {
        icon: TERIOCK.config.rank[this.archetype].classes[this.className].icon,
        label: _loc("TERIOCK.SYSTEMS.Rank.PANELS.class"),
        wrappers: [
          TERIOCK.config.rank[this.archetype].name,
          TERIOCK.config.rank[this.archetype].classes[this.className].name,
          _loc("TERIOCK.SYSTEMS.Rank.PANELS.rank", {
            value: this.classRank,
          }),
        ],
      },
      this._statBar,
      {
        icon: icons.armament.av,
        label: _loc("TERIOCK.SYSTEMS.Rank.PANELS.details"),
        wrappers: [
          this.maxAv === 0
            ? _loc("TERIOCK.SYSTEMS.Power.PANELS.noArmor")
            : _loc("TERIOCK.SYSTEMS.Power.PANELS.maxAv", {
                value: this.maxAv,
              }),
          this.innate ? _loc("TERIOCK.SYSTEMS.Rank.PANELS.innate") : _loc("TERIOCK.SYSTEMS.Rank.PANELS.learned"),
        ],
      },
    ];
  }

  /** @inheritDoc */
  get wikiPage() {
    const prefix = this.constructor.metadata.namespace;
    const pageName =
      TERIOCK.index.classes[foundry.utils.getProperty(this.parent, this.constructor.metadata.pageNameKey)];
    return `${prefix}:${pageName}`;
  }

  /** @inheritDoc */
  async _createFromChildDeltaMap(createMap) {
    if (this.classRank < 3 || this.parent.abilities.length !== 2) {
      await super._createFromChildDeltaMap(createMap);
    }
  }

  /** @inheritDoc */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if (this.parent.checkEditor(userId) && this.actor && this.classRank === 1) {
      if (
        this.archetype !== "everyman" &&
        !this.actor.archetypes.map(a => a.system.identifier).includes(this.archetype)
      ) {
        const archetypeName = TERIOCK.config.rank[this.archetype].name;
        this.actor._stagedItemCreations.add(game.teriock.packs.classes.index.getName(archetypeName).uuid);
      }
    }
  }

  /** @inheritDoc */
  _onDelete(options, userId) {
    super._onDelete(options, userId);
    if (this.parent.checkEditor(userId) && this.actor) {
      const archetypes = this.actor.archetypes.filter(a => a.system.identifier === this.archetype);
      const needsArchetype = this.actor.ranks.filter(r => r.system.archetype === this.archetype).length > 0;
      if (!needsArchetype && archetypes.length > 0) {
        for (const p of archetypes) {
          this.actor._stagedItemDeletions.add(p.id);
        }
      }
    }
  }

  /** @inheritDoc */
  getLocalRollData() {
    return {
      ...super.getLocalRollData(),
      [`archetype.${this.archetype.slice(0, 3).toLowerCase()}`]: 1,
      [`class.${this.className.slice(0, 3).toLowerCase()}`]: 1,
      archetype: this.archetype,
      av: this.maxAv,
      class: this.className,
      innate: this.innate ? 1 : 0,
      maxAv: this.maxAv,
      number: this.classRank,
    };
  }

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    if (this.parent.sup?.type === "species") {
      this.innate = true;
    }
    if (game.teriock.getSetting("armorWeakensRanks") && this.actor && this.actor.system.defense.av.base > this.maxAv) {
      this.proficient = false;
    }
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    for (const pool of Object.values(this.statDice)) {
      if (this.innate) {
        pool.disabled = true;
      }
    }
  }
}
