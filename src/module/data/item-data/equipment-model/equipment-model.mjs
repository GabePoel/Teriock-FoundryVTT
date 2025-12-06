import { EquipmentExecution } from "../../../executions/document-executions/_module.mjs";
import { dotJoin, prefix, suffix } from "../../../helpers/string.mjs";
import { roundTo } from "../../../helpers/utils.mjs";
import { EvaluationField, TextField } from "../../fields/_module.mjs";
import {
  ArmamentDataMixin,
  AttunableDataMixin,
  ConsumableDataMixin,
  ExecutableDataMixin,
  WikiDataMixin,
} from "../../mixins/_module.mjs";
import TeriockBaseItemModel from "../base-item-model/base-item-model.mjs";
import * as contextMenus from "./methods/_context-menus.mjs";
import * as deriving from "./methods/_data-deriving.mjs";
import * as migrate from "./methods/_migrate-data.mjs";
import * as messages from "./methods/_panel-parts.mjs";
import * as parsing from "./methods/_parsing.mjs";
import EquipmentIdentificationPart from "./parts/equipment-identification-part.mjs";
import EquipmentContainerPart from "./parts/equipment-storage-part.mjs";
import EquipmentSuppressionPart from "./parts/equipment-suppression-part.mjs";
import EquipmentWieldingPart from "./parts/equipment-wielding-part.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * Equipment-specific item data model.
 *
 * Relevant wiki pages:
 * - [Equipment](https://wiki.teriock.com/index.php/Category:Equipment)
 *
 * @extends {TeriockBaseItemModel}
 * @mixes ArmamentData
 * @mixes AttunableData
 * @mixes ConsumableData
 * @mixes EquipmentSuppressionPart
 * @mixes EquipmentIdentificationPart
 * @mixes EquipmentWieldingPart
 * @mixes ExecutableData
 * @mixes WikiData
 */
export default class TeriockEquipmentModel extends EquipmentContainerPart(
  EquipmentIdentificationPart(
    EquipmentSuppressionPart(
      EquipmentWieldingPart(
        ArmamentDataMixin(
          AttunableDataMixin(
            ConsumableDataMixin(
              WikiDataMixin(ExecutableDataMixin(TeriockBaseItemModel)),
            ),
          ),
        ),
      ),
    ),
  ),
) {
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
        "system.proficient",
        "system.quantity",
      ],
      type: "equipment",
      usable: true,
      visibleTypes: ["ability", "equipment", "fluency", "property", "resource"],
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    const schema = super.defineSchema();
    Object.assign(schema, {
      consumable: new fields.BooleanField({
        initial: false,
        label: "Consumable",
      }),
      damage: new fields.SchemaField({
        base: new EvaluationField({
          deterministic: false,
        }),
        twoHanded: new EvaluationField({
          deterministic: false,
        }),
        types: new fields.SetField(new fields.StringField()),
      }),
      description: new TextField({
        initial: "",
        label: "Description",
      }),
      equipmentClasses: new fields.SetField(
        new fields.StringField({
          choices: TERIOCK.index.equipmentClasses,
        }),
      ),
      equipmentType: new fields.StringField({
        initial: "Equipment Type",
        label: "Equipment Type",
      }),
      powerLevel: new fields.StringField({
        choices: TERIOCK.options.equipment.powerLevelShort,
        initial: "mundane",
        label: "Power Level",
      }),
      price: new fields.NumberField({
        initial: 0,
        label: "Price",
      }),
      weight: new EvaluationField({
        floor: false,
        ceil: false,
        decimals: 2,
      }),
    });
    return schema;
  }

  /** @inheritDoc */
  static migrateData(data) {
    data = migrate._migrateData(data);
    return super.migrateData(data);
  }

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    return [
      ...contextMenus._entries(this),
      ...super.getCardContextMenuEntries(doc),
    ];
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
      //{
      //  path: "system.equipped",
      //  dataset: {
      //    action: "toggleEquipped",
      //  },
      //},
      ...super.displayToggles,
    ];
  }

  /** @inheritDoc */
  get embedIcons() {
    return [
      {
        icon: this.glued ? "link" : "link-slash",
        action: "toggleGluedDoc",
        tooltip: this.glued ? "Glued" : "Unglued",
        condition: this.parent.isOwner,
        callback: async () => {
          if (this.glued) {
            await this.unglue();
          } else {
            await this.glue();
          }
        },
      },
      {
        icon: this.dampened ? "bell-slash" : "bell",
        action: "toggleDampenedDoc",
        tooltip: this.dampened ? "Dampened" : "Undampened",
        condition: this.parent.isOwner,
        callback: async () => {
          if (this.dampened) {
            await this.undampen();
          } else {
            await this.dampen();
          }
        },
      },
      {
        icon: this.shattered ? "wine-glass-crack" : "wine-glass",
        action: "toggleShatteredDoc",
        tooltip: this.shattered ? "Shattered" : "Shattered",
        condition: this.parent.isOwner,
        callback: async () => {
          if (this.shattered) {
            await this.repair();
          } else {
            await this.shatter();
          }
        },
      },
      ...super.embedIcons.filter(
        (i) => !i.action?.toLowerCase().includes("disabled"),
      ),
      {
        icon: this.equipped ? "circle-check" : "circle",
        action: "toggleEquippedDoc",
        tooltip: this.equipped ? "Equipped" : "Unequipped",
        condition: this.parent.isOwner,
        callback: async () => {
          if (this.equipped) {
            await this.unequip();
          } else {
            await this.equip();
          }
        },
      },
    ];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    if (!this.consumable) {
      parts.subtitle = this.equipmentType;
    }
    parts.struck = !this.isEquipped;
    parts.shattered = this.shattered;
    parts.text = dotJoin([
      suffix(this.damage.base.text, "damage"),
      suffix(this.bv.value, "BV"),
      suffix(this.av.value, "AV"),
      prefix(this.tier.value, "Tier"),
      suffix(this.weight.total + this.storage.carriedWeight, "lb"),
      this.sup?.nameString || "",
    ]);
    return parts;
  }

  /**
   * If this has a two-handed damage attack.
   * @returns {boolean}
   */
  get hasTwoHandedAttack() {
    return (
      this.damage.twoHanded.nonZero &&
      this.damage.twoHanded.formula !== this.damage.base.formula
    );
  }

  /** @inheritDoc */
  get makeSuppressed() {
    let suppressed = super.makeSuppressed || !this.isEquipped;
    if (this.actor && this.actor.system.isTransformed) {
      if (
        this.parent.elder?.documentName === "Actor" &&
        this.actor.system.transformation.suppression.equipment
      ) {
        suppressed = true;
      }
    }
    return suppressed;
  }

  /** @inheritDoc */
  get panelParts() {
    return {
      ...super.panelParts,
      ...messages._panelParts(this),
    };
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

  /** @inheritDoc */
  async parse(rawHTML) {
    return await parsing._parse(this, rawHTML);
  }

  /**
   * @inheritDoc
   * @returns {Teriock.Execution.EquipmentExecutionOptions}
   */
  parseEvent(event) {
    const options =
      /** @type {Teriock.Execution.EquipmentExecutionOptions} */
      super.parseEvent(event);
    Object.assign(options, {
      secret: event.shiftKey,
      twoHanded: event.ctrlKey,
    });
    return options;
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    deriving._prepareDerivedData(this);
  }

  /** @inheritDoc */
  prepareSpecialData() {
    if (!this.identification.identified && !this.isAttuned) {
      this.tier.raw = "";
    }
    super.prepareSpecialData();
    this.weight.evaluate();
    this.weight.total = this.weight.value;
    if (this.consumable) {
      this.weight.total = roundTo(this.weight.value * this.quantity, 2);
    }
    if (!this.hasTwoHandedAttack) {
      this.damage.twoHanded.raw = this.damage.base.raw;
    }
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.EquipmentExecutionOptions} options
   */
  async roll(options = {}) {
    if (game.settings.get("teriock", "rollAttackOnArmamentUse")) {
      await this.actor?.useAbility("Basic Attack");
    }
    options.source = this.parent;
    const execution = new EquipmentExecution(options);
    await execution.execute();
  }
}
