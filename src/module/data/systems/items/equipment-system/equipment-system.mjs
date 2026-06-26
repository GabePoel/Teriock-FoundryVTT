import { EquipmentExecution } from "../../../../executions/document-executions/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { dotJoin, toCamelCase, toKebabCase } from "../../../../helpers/string.mjs";
import { fromIdentifier, getName, objectMap } from "../../../../helpers/utils.mjs";
import { IdentifierField } from "../../../fields/_module.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import { migrateValueTransform } from "../../../shared/migrations/source-migrations.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
import BaseItemSystem from "../base-item-system/base-item-system.mjs";
import * as parts from "./parts/_module.mjs";

const { fields } = foundry.data;

/**
 * Equipment-specific item data model.
 *
 * Relevant wiki pages:
 * - [Equipment](https://wiki.teriock.com/index.php/Category:Equipment)
 *
 * @extends {BaseItemSystem}
 * @extends {Teriock.Models.EquipmentSystemData}
 * @mixes ArmamentSystem
 * @mixes AttunableSystem
 * @mixes ConsumableSystem
 * @mixes EquipmentIdentificationPart
 * @mixes EquipmentMigrationPart
 * @mixes EquipmentPanelPart
 * @mixes EquipmentStoragePart
 * @mixes EquipmentSuppressionPart
 * @mixes EquipmentWieldingPart
 * @mixes WikiSystem
 */
export default class EquipmentSystem
  extends mixClasses(
    BaseItemSystem,
    systemMixins.ArmamentSystemMixin,
    systemMixins.AttunableSystemMixin,
    systemMixins.ConsumableSystemMixin,
    systemMixins.WikiSystemMixin,
    parts.EquipmentIdentificationPart,
    parts.EquipmentMigrationPart,
    parts.EquipmentPanelPart,
    parts.EquipmentStoragePart,
    parts.EquipmentSuppressionPart,
    parts.EquipmentWieldingPart,
  )
{
  /** @inheritDoc */
  static Execution = EquipmentExecution;

  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Equipment"];

  /** @inheritDoc */
  static PRESERVED_PROPERTIES = [
    "img",
    "name",
    "system.description",
    "system.flaws",
    "system.instructions",
    "system.notes",
    "system.powerLevel",
    ...super.PRESERVED_PROPERTIES,
  ];

  static get _automationTypes() {
    return [
      ...super._automationTypes,
      automations.ChatMacroAutomation,
      automations.CommonOutcomesAutomation,
      automations.CoverAutomation,
      automations.HacksAutomation,
      automations.RollAutomation,
      automations.TakeAutomation,
      automations.UseDocumentsAutomation,
    ];
  }

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      childItemTypes: ["equipment"],
      type: "equipment",
      usable: true,
      visibleTypes: ["equipment", ...super.metadata.visibleTypes],
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      consumable: new fields.BooleanField({ initial: false }),
      equipmentType: new IdentifierField({ type: "equipment" }),
      powerLevel: new fields.StringField({
        choices: objectMap(TERIOCK.config.equipment.powerLevel, e => e.label),
        initial: "mundane",
      }),
      price: new fields.NumberField({ initial: 0 }),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    migrateValueTransform(source, "equipmentType", toKebabCase);
    return super.migrateData(source, options, state);
  }

  /** @inheritDoc */
  get _attunableWrappers() {
    if (!this.identification.identified && !this.isAttuned) { return []; }
    return super._attunableWrappers;
  }

  /** @inheritDoc */
  get _displayInputs() {
    return ["system.equipmentClasses", ...super._displayInputs];
  }

  /** @inheritDoc */
  get _displayTags() {
    return [...super._displayTags, ...this._identificationTags, ...this._attunableTags];
  }

  /** @inheritDoc */
  get _displayToggles() {
    return ["system.consumable", ...super._displayToggles];
  }

  /** @inheritDoc */
  get _refreshPromises() {
    const promises = super._refreshPromises;
    if (this.equipmentType) {
      promises.push(
        this._formatRefreshPromise(
          fromIdentifier(this.equipmentType),
          "TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentType.label",
        ),
      );
    }
    return promises;
  }

  /** @inheritDoc */
  get color() {
    if (this.isOverCapacity) { return TERIOCK.display.colors.palette.red; }
    if (!this.identification.read) { return TERIOCK.display.colors.palette.grey; }
    return TERIOCK.config.equipment.powerLevel[this.powerLevel].color;
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    return Object.assign(parts, {
      subtitle: !this.consumable ? getName(this.equipmentType) : parts.subtitle,
      text: dotJoin([
        ...this._attunableWrappers,
        _loc("TERIOCK.SYSTEMS.Equipment.PANELS.weight", { value: this.totalWeight }),
        parts.text,
      ]),
    });
  }

  /** @inheritDoc */
  get wikiPage() {
    return `Equipment:${TERIOCK.index.equipment[toCamelCase(this._source.equipmentType ?? "")] ?? ""}`;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    if (this.parent.isEmbedded) { this.updateSource({ equipped: true }); }
  }

  /** @inheritDoc */
  getLocalRollData() {
    return Object.assign(super.getLocalRollData(), {
      [`power.${toCamelCase(this.powerLevel)}`]: 1,
      [`type.${toCamelCase(this._source.equipmentType)}`]: 1,
      price: this.price,
    });
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.fightingStyle && this.fightingStyle.length > 0) {
      this.specialRules = TERIOCK.content.weaponFightingStyles[this.fightingStyle];
    }
  }
}
