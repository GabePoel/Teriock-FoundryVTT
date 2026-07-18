import { DocumentSelector } from "../../../../applications/dialogs/_module.mjs";
import classConfig from "../../../../constants/config/class-config.mjs";
import { icons } from "../../../../constants/display/icons.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { localizeChoices } from "../../../../helpers/localization.mjs";
import { toCamelCase, toKebabCase } from "../../../../helpers/string.mjs";
import { getName, objectMap } from "../../../../helpers/utils.mjs";
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
 * @mixes ArmorSuppressionSystem
 * @mixes CompetenceDisplaySystem
 * @mixes StatGiverSystem
 * @mixes WikiSystem
 */
export default class RankSystem
  extends mixClasses(
    BaseItemSystem,
    systemMixins.ArmorSuppressionSystemMixin,
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
      archetype: archetypeField({ blank: false, initial: "everyman", required: true }),
      class: classField({ blank: false, initial: "journeyman", required: true }),
      competence: new fields.EmbeddedDataField(CompetenceModel, { initial: { raw: 1 } }),
      description: new fields.HTMLField(),
      maxAv: new fields.NumberField({ initial: classConfig.defaults.maxAv, integer: true, min: 0 }),
      number: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      origin: new fields.StringField({
        blank: false,
        choices: localizeChoices(objectMap(classConfig.origins, v => v.label)),
        initial: "learned",
        required: true,
      }),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    migrateKey(source, "className", "class");
    migrateKey(source, "classRank", "number");
    migrateKey(source, "innate", "origin", val => (val ? "innate" : "learned"));
    migrateValueTransform(source, "class", toKebabCase);
    return super.migrateData(source, options, state);
  }

  /**
   * Prompt to choose which combat and support abilities to keep.
   * @returns {Promise<void>}
   */
  async #onCreateSelectAbilities() {
    const elder = await this.parent.getElder();
    const otherRanks = (await elder?.getRanks() ?? []).filter(r =>
      r.system.class === this.class && r.id !== this.parent.id
    );
    const toDelete = [];
    for (const category of ["combat", "support"]) {
      const selectMap = new Map(
        this.parent.abilities.filter(a => a.getFlag("teriock", "category") === category).map(a => [a.lookupKey, a]),
      );
      for (const rank of otherRanks) {
        for (const a of rank.abilities) {
          const key = a.lookupKey;
          if (selectMap.has(key)) {
            toDelete.push(selectMap.get(key).id);
            selectMap.delete(key);
          }
        }
      }
      if (selectMap.size) {
        const chosen = await DocumentSelector.selectSingle(Array.from(selectMap.values()), {
          openable: true,
          title: _loc(`TERIOCK.SHEETS.Common.MENU.CreateRank.select${category.capitalize()}`),
        });
        if (!chosen) { continue; }
        toDelete.push(...selectMap.values().filter(a => a.id !== chosen.id).map(a => a.id));
      }
    }
    if (toDelete.length) {
      await foundry.documents.modifyBatch([{
        action: "delete",
        documentName: "ActiveEffect",
        ids: toDelete,
        pack: this.parent.pack,
        parent: this.parent,
      }, {
        action: "update",
        documentName: "Item",
        pack: this.parent.pack,
        parent: this.parent.parent,
        updates: [{ _id: this.parent.id, system: { instructions: "" } }],
      }]);
    }
  }

  /**
   * Stage needed archetypes for creation.
   */
  #stageArchetypeCreation() {
    const archetypeConfig = TERIOCK.config.class.archetypes[this._source.archetype];
    if (!archetypeConfig?.dontStage && !this.actor.archetypes.some(a => a.typedIdentifier === this.archetype)) {
      this.actor._stagedItemCreations.add(this.archetype);
    }
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
          classConfig.origins[this.origin].label,
        ],
      },
    ];
  }

  /** @inheritDoc */
  get _refreshCanCreateChildren() {
    return this.number < 3 || this.parent.abilities.length !== 2;
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
    return classConfig.origins[this.origin].color;
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = getName(this.archetype);
    parts.text ||= classConfig.origins[this.origin].label;
    return parts;
  }

  /**
   * Whether this rank was gained innately rather than learned.
   * @returns {boolean}
   */
  get innate() {
    return this.origin === "innate";
  }

  /** @inheritDoc */
  get isOnWiki() {
    return this.number > 0 && this.number <= 5;
  }

  /** @inheritDoc */
  get wikiPage() {
    return `Class:${TERIOCK.index.classes[toCamelCase(this._source.class ?? "")] ?? ""}`;
  }

  /** @inheritDoc */
  _canToggleStatDice(stat) {
    return super._canToggleStatDice(stat) && !this.innate;
  }

  /** @inheritDoc */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if (this.parent.checkEditor(userId)) {
      if (this.actor) { this.#stageArchetypeCreation(); }
      if (options.interactive) { this.#onCreateSelectAbilities(); }
    }
  }

  /** @inheritDoc */
  _onDelete(options, userId) {
    super._onDelete(options, userId);
    if (this.parent.checkEditor(userId) && this.actor) { this.#stageArchetypeDeletion(); }
  }

  /** @inheritDoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    // A class change carries an archetype change with it.
    const archetypeChanged = foundry.utils.hasProperty(changed, "system.archetype")
      || foundry.utils.hasProperty(changed, "system.class");
    if (this.parent.checkEditor(userId) && this.actor && archetypeChanged) {
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
      [`origin.${this.origin}`]: 1,
      archetype: this._source.archetype,
      class: this._source.class,
      maxAv: this.maxAv,
      number: this.number,
      origin: this.origin,
    };
  }

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    // Enforce matching class/archetype
    this.archetype = `archetype:${
      TERIOCK.config.class.classes[toCamelCase(this._source.class)]?.archetype ?? this._source.archetype
    }`;
    if (this.parent.sup?.type === "species") { this.origin = "innate"; }
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
