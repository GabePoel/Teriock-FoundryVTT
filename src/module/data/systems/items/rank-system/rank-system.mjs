import { default as classConfig } from "../../../../constants/config/class-config.mjs";
import { icons } from "../../../../constants/display/icons.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { IdentifierField } from "../../../fields/_module.mjs";
import { CompetenceModel } from "../../../models/_module.mjs";
import { migrateKey } from "../../../shared/migrations/source-migrations.mjs";
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
export default class RankSystem
  extends mixClasses(
    BaseItemSystem,
    mixins.CompetenceDisplaySystemMixin,
    mixins.WikiSystemMixin,
    mixins.StatGiverSystemMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Rank"];

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { namespace: "Class", pageNameKey: "system.class", type: "rank" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      archetype: new IdentifierField({
        choices: objectMap(classConfig.archetypes, a => a.label, { localize: true }),
        initial: "everyman",
      }),
      class: new fields.StringField({
        choices: objectMap(classConfig.classes, a => a.label, { localize: true }),
        initial: "journeyman",
      }),
      competence: new fields.EmbeddedDataField(CompetenceModel, { initial: { raw: 1 } }),
      description: new fields.HTMLField(),
      innate: new fields.BooleanField({ initial: false }),
      maxAv: new fields.NumberField({ initial: 2, integer: true, min: 0 }),
      number: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    migrateKey(source, "className", "class");
    migrateKey(source, "classRank", "number");
    return super.migrateData(source, options, state);
  }

  /**
   * Stage needed archetypes for creation.
   */
  #stageArchetypeCreation() {
    const archetypeConfig = TERIOCK.config.class.archetypes[this._source.archetype];
    if (
      !archetypeConfig?.dontStage
      && !this.actor.archetypes.map(a => a.system.identifier).includes(this._source.archetype)
    ) { this.actor._stagedItemCreations.add(`archetype:${this._source.archetype}`); }
  }

  /**
   * Stage unneeded archetypes for deletion.
   */
  #stageArchetypeDeletion() {
    const neededArchetypes = new Set(this.actor.ranks.map(r => r.system.archetype));
    for (const a of this.actor.archetypes) {
      if (!neededArchetypes.has(a.system.identifier)) { this.actor._stagedItemDeletions.add(a.id); }
    }
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
    if (this.innate) { return TERIOCK.display.colors.palette.purple; }
    return TERIOCK.display.colors.palette.grey;
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = TERIOCK.config.class.archetypes[this.archetype].label;
    parts.text ||= this.innate ? _loc("TERIOCK.TERMS.PowerType.innate") : _loc("TERIOCK.TERMS.PowerType.learned");
    return parts;
  }

  /** @inheritDoc */
  get isOnWiki() {
    return this.number > 0 && this.number <= 5;
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
    return suppressed;
  }

  /** @inheritDoc */
  get messageBars() {
    return [
      {
        icon: TERIOCK.config.class.classes[this.class].icon,
        label: _loc("TERIOCK.SYSTEMS.Rank.PANELS.class"),
        wrappers: [
          TERIOCK.config.class.archetypes[this.archetype].label,
          TERIOCK.config.class.classes[this.class].label,
          _loc("TERIOCK.SYSTEMS.Rank.PANELS.rank", { value: this.number }),
        ],
      },
      this._statBar,
      {
        icon: icons.armament.av,
        label: _loc("TERIOCK.SYSTEMS.Rank.PANELS.details"),
        wrappers: [
          this.maxAv === 0
            ? _loc("TERIOCK.SYSTEMS.Power.PANELS.noArmor")
            : _loc("TERIOCK.SYSTEMS.Power.PANELS.maxAv", { value: this.maxAv }),
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
    if (this.number < 3 || this.parent.abilities.length !== 2) { await super._createFromChildDeltaMap(createMap); }
  }

  /** @inheritDoc */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if (this.parent.checkEditor(userId) && this.actor) { this.#stageArchetypeCreation(); }
  }

  /** @inheritDoc */
  _onDelete(options, userId) {
    super._onDelete(options, userId);
    if (this.parent.checkEditor(userId) && this.actor) { this.#stageArchetypeDeletion(); }
  }

  /** @inheritDoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    if (this.parent.checkEditor(userId) && this.actor && foundry.utils.hasProperty(changed, "system.archetype")) {
      this.#stageArchetypeCreation();
      this.#stageArchetypeDeletion();
    }
  }

  /** @inheritDoc */
  getLocalRollData() {
    return {
      ...super.getLocalRollData(),
      [`archetype.${this.archetype.slice(0, 3).toLowerCase()}`]: 1,
      [`class.${this.class.slice(0, 3).toLowerCase()}`]: 1,
      archetype: this.archetype,
      av: this.maxAv,
      class: this.class,
      innate: this.innate ? 1 : 0,
      maxAv: this.maxAv,
      number: this.number,
    };
  }

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    if (this.parent.sup?.type === "species") { this.innate = true; }
    if (
      game.teriock.getSetting("armorWeakensRanks") && this.actor && this.actor.system.defense.av.base > this.maxAv
    ) { this.proficient = false; }
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    for (const pool of Object.values(this.statDice)) { if (this.innate) { pool.disabled = true; } }
  }
}
