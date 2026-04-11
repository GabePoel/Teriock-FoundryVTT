import { EquipmentExecution } from "../../../../executions/document-executions/_module.mjs";
import { mix } from "../../../../helpers/construction.mjs";
import {
  dotJoin,
  toCamelCase,
  toKebabCase,
} from "../../../../helpers/string.mjs";
import { inferNameFromIdentifier } from "../../../../helpers/utils.mjs";
import { IdentifierField } from "../../../fields/_module.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
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
export default class EquipmentSystem extends mix(
  BaseItemSystem,
  mixins.ArmamentSystemMixin,
  mixins.AttunableSystemMixin,
  mixins.ConsumableSystemMixin,
  mixins.WikiSystemMixin,
  parts.EquipmentIdentificationPart,
  parts.EquipmentMigrationPart,
  parts.EquipmentPanelPart,
  parts.EquipmentStoragePart,
  parts.EquipmentSuppressionPart,
  parts.EquipmentWieldingPart,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.SYSTEMS.Equipment",
  ];

  /** @inheritDoc */
  static PRESERVED_PROPERTIES = [
    "name",
    "img",
    "system.description",
    "system.flaws",
    "system.notes",
    "system.powerLevel",
    ...super.PRESERVED_PROPERTIES,
  ];

  static get _automationTypes() {
    return [
      ...super._automationTypes,
      automations.ChatMacroAutomation,
      automations.CommonImpactsAutomation,
      automations.HacksAutomation,
      automations.RollAutomation,
      automations.TakeAutomation,
      automations.UseExternalDocumentsAutomation,
      automations.UseLocalDocumentsAutomation,
    ];
  }

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      childItemTypes: ["equipment"],
      indexCategoryKey: "equipment",
      indexCompendiumKey: "equipment",
      namespace: "Equipment",
      pageNameKey: "system.equipmentType",
      type: "equipment",
      usable: true,
      visibleTypes: ["ability", "equipment", "fluency", "property", "resource"],
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      consumable: new fields.BooleanField({ initial: false }),
      equipmentType: new IdentifierField({ initial: "" }),
      powerLevel: new fields.StringField({
        choices: TERIOCK.options.equipment.powerLevelShort,
        initial: "mundane",
      }),
      price: new fields.NumberField({ initial: 0 }),
    });
  }

  /** @inheritDoc */
  static migrateData(data) {
    if (data.equipmentType) {
      data.equipmentType = toKebabCase(data.equipmentType);
    }
    return super.migrateData(data);
  }

  /** @inheritDoc */
  static parseEvent(event) {
    return Object.assign(super.parseEvent(event), {
      secret: game.teriock.getSetting("secretEquipment")
        ? !event.shiftKey
        : event.shiftKey,
    });
  }

  /** @inheritDoc */
  get color() {
    if (this.isOverCapacity) {
      return TERIOCK.display.colors.red;
    }
    if (!this.identification.read) {
      return TERIOCK.display.colors.grey;
    }
    return TERIOCK.options.equipment.powerLevel[this.powerLevel].color;
  }

  /** @inheritDoc */
  get displayTags() {
    return [
      ...super.displayTags,
      ...this._identificationTags,
      ...this._attunableTags,
    ];
  }

  /** @inheritDoc */
  get displayToggles() {
    return ["system.consumable", ...super.displayToggles];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    return Object.assign(parts, {
      subtitle: !this.consumable
        ? inferNameFromIdentifier(`equipment:${this.equipmentType}`)
        : parts.subtitle,
      text: dotJoin([
        ...this._attunableWrappers,
        _loc("TERIOCK.SYSTEMS.Equipment.PANELS.weight", {
          value: this.weight.total + this.storage.carriedWeight,
        }),
        parts.text,
      ]),
    });
  }

  /** @inheritDoc */
  get wikiPage() {
    return `Equipment:${inferNameFromIdentifier(`equipment:${this.equipmentType}`)}`;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) return false;

    if (this.parent.isEmbedded) {
      this.updateSource({ equipped: true });
    }
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.EquipmentExecutionOptions} options
   */
  async _use(options = {}) {
    if (game.teriock.getSetting("rollAttackOnArmamentUse")) {
      await this.actor?.useDocument("basic-attack", { type: "ability" });
    }
    await new EquipmentExecution(options).execute();
  }

  /** @inheritDoc */
  getLocalRollData() {
    return Object.assign(super.getLocalRollData(), {
      price: this.price,
      [`type.${toCamelCase(this.equipmentType)}`]: 1,
      [`power.${toCamelCase(this.powerLevel)}`]: 1,
    });
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.fightingStyle && this.fightingStyle.length > 0) {
      this.specialRules =
        TERIOCK.content.weaponFightingStyles[this.fightingStyle];
    }
  }

  /** @inheritDoc */
  prepareSpecialData() {
    if (!this.identification.identified && !this.isAttuned) {
      this.tier.raw = "";
    }
    super.prepareSpecialData();
  }
}
