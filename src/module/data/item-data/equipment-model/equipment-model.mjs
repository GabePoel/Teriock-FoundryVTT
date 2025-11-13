import { getItem } from "../../../helpers/fetch.mjs";
import { formulaExists, mergeMetadata } from "../../../helpers/utils.mjs";
import {
  ArmamentDataMixin,
  AttunableDataMixin,
  ConsumableDataMixin,
  ExecutableDataMixin,
  WikiDataMixin,
} from "../../mixins/_module.mjs";
import {
  deriveModifiableDeterministic,
  deriveModifiableIndeterministic,
  deriveModifiableNumber,
  prepareModifiableBase,
} from "../../shared/fields/modifiable.mjs";
import TeriockBaseItemModel from "../base-item-model/base-item-model.mjs";
import * as contextMenus from "./methods/_context-menus.mjs";
import * as deriving from "./methods/_data-deriving.mjs";
import * as messages from "./methods/_messages.mjs";
import * as migrate from "./methods/_migrate-data.mjs";
import * as parsing from "./methods/_parsing.mjs";
import * as rolling from "./methods/_rolling.mjs";
import * as schema from "./methods/_schema.mjs";
import EquipmentIdentificationPart from "./parts/equipment-identification-part.mjs";
import EquipmentSuppressionPart from "./parts/equipment-suppression-part.mjs";
import EquipmentWieldingPart from "./parts/equipment-wielding-part.mjs";

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
export default class TeriockEquipmentModel extends EquipmentIdentificationPart(
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
) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    namespace: "Equipment",
    pageNameKey: "system.equipmentType",
    type: "equipment",
    usable: true,
    childEffectTypes: ["ability", "fluency", "property", "resource"],
    indexCategoryKey: "equipment",
    indexCompendiumKey: "equipment",
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
  });

  /** @inheritDoc */
  static defineSchema() {
    const s = super.defineSchema();
    Object.assign(s, schema._defineSchema());
    return s;
  }

  /** @inheritDoc */
  static migrateData(data) {
    data = migrate._migrateData(data);
    return super.migrateData(data);
  }

  /** @inheritDoc */
  get cardContextMenuEntries() {
    return [...super.cardContextMenuEntries, ...contextMenus._entries(this)];
  }

  /** @inheritDoc */
  get color() {
    if (!this.read) {
      return TERIOCK.display.colors.grey;
    }
    return TERIOCK.options.equipment.powerLevel[this.powerLevel].color;
  }

  /**
   * If this has a two-handed damage attack.
   * @returns {boolean}
   */
  get hasTwoHandedAttack() {
    return formulaExists(this.damage.twoHanded.saved);
  }

  /** @inheritDoc */
  get messageParts() {
    return {
      ...super.messageParts,
      ...messages._messageParts(this),
    };
  }

  /** @inheritDoc */
  get suppressed() {
    let suppressed = super.suppressed || !this.isEquipped;
    if (this.actor && this.actor.system.isTransformed) {
      if (
        this.parent.source.documentName === "Actor" &&
        this.actor.system.transformation.suppression.equipment
      ) {
        suppressed = true;
      }
    }
    return suppressed;
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
  async getIndexReference() {
    return await getItem(this.equipmentType, "equipment");
  }

  /** @inheritDoc */
  async parse(rawHTML) {
    return await parsing._parse(this, rawHTML);
  }

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    prepareModifiableBase(this.weight);
    prepareModifiableBase(this.minStr);
    prepareModifiableBase(this.damage.twoHanded);
    prepareModifiableBase(this.range.long);
    prepareModifiableBase(this.range.short);
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    deriving._prepareDerivedData(this);
  }

  /** @inheritDoc */
  prepareSpecialData() {
    super.prepareSpecialData();
    deriveModifiableNumber(this.minStr, { min: -3 });
    deriveModifiableIndeterministic(this.damage.twoHanded);
    deriveModifiableDeterministic(this.range.long, this.parent);
    deriveModifiableDeterministic(this.range.short, this.parent);
    deriveModifiableNumber(this.weight, { min: 0 });
    this.weight.total = this.weight.value;
    if (this.consumable) {
      this.weight.total = this.weight.value * this.quantity;
    }
    if (!this.hasTwoHandedAttack) {
      this.damage.twoHanded.value = this.damage.base.value;
    }
  }

  /** @inheritDoc */
  async roll(options) {
    if (game.settings.get("teriock", "rollAttackOnEquipmentUse")) {
      await this.actor?.useAbility("Basic Attack", options);
      options.advantage = false;
      options.disadvantage = false;
      options.crit = false;
    }
    await rolling._roll(this, options);
  }
}
