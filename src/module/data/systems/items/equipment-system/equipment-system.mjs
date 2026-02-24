import { EquipmentExecution } from "../../../../executions/document-executions/_module.mjs";
import { formulaExists } from "../../../../helpers/formula.mjs";
import { dotJoin, toCamelCase } from "../../../../helpers/string.mjs";
import { mix } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseItemSystem from "../base-item-system/base-item-system.mjs";
import * as parts from "./parts/_module.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * Equipment-specific item data model.
 *
 * Relevant wiki pages:
 * - [Equipment](https://wiki.teriock.com/index.php/Category:Equipment)
 *
 * @extends {BaseItemSystem}
 * @implements {Teriock.Models.EquipmentSystemInterface}
 * @mixes ArmamentSystem
 * @mixes AttunableSystem
 * @mixes ConsumableSystem
 * @mixes EquipmentDamagePart
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
  parts.EquipmentDamagePart,
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
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      childItemTypes: ["equipment"],
      indexCategoryKey: "equipment",
      indexCompendiumKey: "equipment",
      namespace: "Equipment",
      pageNameKey: "system.equipmentType",
      preservedProperties: [
        "name",
        "img",
        "system.consumable",
        "system.description",
        "system.flaws",
        "system.fluent",
        "system.maxQuantity",
        "system.notes",
        "system.powerLevel",
        "system.competence",
        "system.quantity",
      ],
      type: "equipment",
      usable: true,
      visibleTypes: ["ability", "equipment", "fluency", "property", "resource"],
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      consumable: new fields.BooleanField({
        initial: false,
      }),
      equipmentClasses: new fields.SetField(
        new fields.StringField({
          choices: TERIOCK.reference.equipmentClasses,
        }),
      ),
      equipmentType: new fields.StringField({
        initial: "",
      }),
      powerLevel: new fields.StringField({
        choices: TERIOCK.options.equipment.powerLevelShort,
        initial: "mundane",
      }),
      price: new fields.NumberField({
        initial: 0,
      }),
    });
  }

  /** @inheritDoc */
  static parseEvent(event) {
    return Object.assign(super.parseEvent(event), {
      secret: game.settings.get("teriock", "secretEquipment")
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
  get displayToggles() {
    return [
      "system.glued",
      {
        path: "system.shattered",
        dataset: {
          action: "toggleShattered",
        },
      },
      {
        path: "system.dampened",
        dataset: {
          action: "toggleDampened",
        },
      },
      "system.consumable",
      ...super.displayToggles,
    ];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    if (!this.consumable) {
      parts.subtitle = this.equipmentType;
    }
    parts.text = dotJoin([
      ...this._damageWrappers,
      ...this._defenseBar.wrappers,
      formulaExists(this.tier.text)
        ? game.i18n.format("TERIOCK.SYSTEMS.Attunable.PANELS.tier", {
            value: this.tier.text,
          })
        : "",
      game.i18n.format("TERIOCK.SYSTEMS.Equipment.PANELS.weight", {
        value: this.weight.total + this.storage.carriedWeight,
      }),
      this.sup?.nameString || "",
    ]);
    return parts;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }
    if (this.parent.isEmbedded) {
      this.updateSource({ equipped: false });
    }
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.EquipmentExecutionOptions} options
   */
  async _use(options = {}) {
    if (game.settings.get("teriock", "rollAttackOnArmamentUse")) {
      await this.actor?.useAbility("Basic Attack");
    }
    options.source = this.parent;
    const execution = new EquipmentExecution(options);
    await execution.execute();
  }

  /** @inheritDoc */
  getLocalRollData() {
    const data = super.getLocalRollData();
    Object.assign(data, {
      price: this.price,
      [`type.${toCamelCase(this.equipmentType)}`]: 1,
      [`power.${toCamelCase(this.powerLevel)}`]: 1,
    });
    for (const equipmentClass of this.equipmentClasses) {
      data[`class.${equipmentClass}`] = 1;
    }
    return data;
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
