import classConfig from "../../../../constants/config/class-config.mjs";
import { icons } from "../../../../constants/display/icons.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { toCamelCase, toKebabCase } from "../../../../helpers/string.mjs";
import { getName } from "../../../../helpers/utils.mjs";
import { archetypeField, classField } from "../../../fields/tools/builders.mjs";
import { migrateKey, migrateValueTransform } from "../../../migrations/source-migrations.mjs";
import { CompetenceModel } from "../../../models/_module.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
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
    systemMixins.CompetenceDisplaySystemMixin,
    systemMixins.WikiSystemMixin,
    systemMixins.StatGiverSystemMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Rank"];

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { type: "rank" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      archetype: archetypeField(),
      class: classField(),
      competence: new fields.EmbeddedDataField(CompetenceModel, { initial: { raw: 1 } }),
      description: new fields.HTMLField(),
      innate: new fields.BooleanField({ initial: false }),
      maxAv: new fields.NumberField({ initial: classConfig.defaults.maxAv, integer: true, min: 0 }),
      number: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    migrateKey(source, "className", "class");
    migrateKey(source, "classRank", "number");
    migrateValueTransform(source, "class", toKebabCase);
    return super.migrateData(source, options, state);
  }

  /**
   * Stage needed archetypes for creation.
   */
  #stageArchetypeCreation() {
    const archetypeConfig = TERIOCK.config.class.archetypes[this._source.archetype];
    if (
      !archetypeConfig?.dontStage && !this.actor.archetypes.map(a => a.typedIdentifier).includes(this.archetype)
    ) { this.actor._stagedItemCreations.add(this.archetype); }
  }

  /**
   * Stage unneeded archetypes for deletion.
   */
  #stageArchetypeDeletion() {
    const neededArchetypes = new Set(this.actor.ranks.map(r => r.system.archetype));
    for (const a of this.actor.archetypes) {
      if (!neededArchetypes.has(a.typedIdentifier)) { this.actor._stagedItemDeletions.add(a.id); }
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
  get _displayMessagesSuppression() {
    const messages = super._displayMessagesSuppression;
    if (this._isSuppressedArmor) { this._addSuppressionMessage("armor", messages); }
    return messages;
  }

  /**
   * If this is suppressed due to worn armor exceeding maximum AV.
   * @returns {boolean}
   */
  get _isSuppressedArmor() {
    return Boolean(
      game.settings.get("teriock", "armorSuppressesRanks")
        && this.actor
        && !this.innate
        && this.actor.system.defense.av.base > this.maxAv,
    );
  }

  /** @inheritDoc */
  get _panelBars() {
    return [
      {
        icon: this.classIcon,
        label: _loc("TERIOCK.SYSTEMS.Rank.PANELS.class"),
        wrappers: [
          getName(this.archetype),
          getName(this.class),
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

  /**
   * The icon for this rank's class.
   * @returns {string}
   */
  get classIcon() {
    return TERIOCK.config.class.classes[toCamelCase(this._source.class)]?.icon;
  }

  /** @inheritDoc */
  get color() {
    if (this.innate) { return TERIOCK.display.colors.palette.purple; }
    return TERIOCK.display.colors.palette.grey;
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = getName(this.archetype);
    parts.text ||= this.innate ? _loc("TERIOCK.TERMS.PowerType.innate") : _loc("TERIOCK.TERMS.PowerType.learned");
    return parts;
  }

  /** @inheritDoc */
  get isOnWiki() {
    return this.number > 0 && this.number <= 5;
  }

  /** @inheritDoc */
  get makeSuppressed() {
    return super.makeSuppressed || this._isSuppressedArmor;
  }

  /** @inheritDoc */
  get wikiPage() {
    return `Class:${TERIOCK.index.classes[toCamelCase(this._source.class ?? "")] ?? ""}`;
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
      [`archetype.${this._source.archetype}`]: 1,
      [`class.${this._source.class}`]: 1,
      archetype: this._source.archetype,
      class: this._source.class,
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
      game.settings.get("teriock", "armorWeakensRanks") && this.actor && this.actor.system.defense.av.base > this.maxAv
    ) {
      this.competence.raw = 0;
      for (const e of this.parent.effects) { foundry.utils.setProperty(e, "system.competence.raw", 0); }
    }
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    for (const pool of Object.values(this.statDice)) { if (this.innate) { pool.disabled = true; } }
  }
}
