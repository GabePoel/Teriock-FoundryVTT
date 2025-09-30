import { propertyPseudoHooks } from "../../../constants/system/pseudo-hooks.mjs";
import { getRollIcon, mergeFreeze } from "../../../helpers/utils.mjs";
import {
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
import TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import * as attunement from "./methods/_attunement.mjs";
import * as contextMenus from "./methods/_context-menus.mjs";
import * as deriving from "./methods/_data-deriving.mjs";
import * as identifying from "./methods/_identifying.mjs";
import * as messages from "./methods/_messages.mjs";
import * as migrate from "./methods/_migrate-data.mjs";
import * as parsing from "./methods/_parsing.mjs";
import * as rolling from "./methods/_rolling.mjs";
import * as schema from "./methods/_schema.mjs";

/**
 * Equipment-specific item data model.
 *
 * Relevant wiki pages:
 * - [Equipment](https://wiki.teriock.com/index.php/Category:Equipment)
 *
 * @extends {TeriockBaseItemModel}
 * @mixes ConsumableDataMixin
 * @mixes ExecutableDataMixin
 * @mixes WikiDataMixin
 */
export default class TeriockEquipmentModel extends ConsumableDataMixin(
  WikiDataMixin(ExecutableDataMixin(TeriockBaseItemModel)),
) {
  /**
   * @inheritDoc
   * @type {Readonly<Teriock.Documents.ItemModelMetadata>}
   */
  static metadata = mergeFreeze(super.metadata, {
    namespace: "Equipment",
    pageNameKey: "system.equipmentType",
    type: "equipment",
    usable: true,
    childEffectTypes: ["ability", "fluency", "property", "resource"],
  });

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      ...schema._defineSchema(),
    });
  }

  /** @inheritDoc */
  static migrateData(data) {
    data = migrate._migrateData(data);
    return super.migrateData(data);
  }

  /**
   * Gets the current attunement data for the equipment.
   * @returns {TeriockAttunement|null} The attunement data or null if not attuned.
   */
  get attunement() {
    return attunement._getAttunement(this);
  }

  /**
   * Checks if equipping is a valid operation.
   * @returns {boolean}
   */
  get canEquip() {
    return (
      ((this.consumable && this.quantity >= 1) || !this.consumable) &&
      !this.isEquipped
    );
  }

  /**
   * Checks if unequipping is a valid operation.
   * @returns {boolean}
   */
  get canUnequip() {
    return (
      ((this.consumable && this.quantity >= 1) || !this.consumable) &&
      this.isEquipped
    );
  }

  /** @inheritDoc */
  get cardContextMenuEntries() {
    return [...super.cardContextMenuEntries, ...contextMenus._entries(this)];
  }

  /**
   * If this has a two-handed damage attack.
   * @returns {boolean}
   */
  get hasTwoHandedAttack() {
    return (
      this.damage.twoHanded.saved.trim().length > 0 &&
      this.damage.twoHanded.saved.trim() !== "0"
    );
  }

  /**
   * Checks if the equipment is currently attuned.
   * @returns {boolean} True if the equipment is attuned, false otherwise.
   */
  get isAttuned() {
    return attunement._attuned(this);
  }

  /**
   * Checks if the equipment is currently equipped.
   * @returns {boolean} - True if the equipment is equipped, false otherwise.
   */
  get isEquipped() {
    if (this.consumable) {
      return this.quantity >= 1 && this.equipped;
    } else {
      return this.equipped;
    }
  }

  /** @inheritDoc */
  get messageParts() {
    return {
      ...super.messageParts,
      ...messages._messageParts(this),
    };
  }

  /** @inheritDoc */
  get secretMessageParts() {
    return {
      ...super.secretMessageParts,
      ...messages._secretMessageParts(this),
    };
  }

  /** @inheritDoc */
  get useIcon() {
    return getRollIcon(this.damage.base.value);
  }

  /**
   * Attunes the equipment to the current character.
   * @returns {Promise<TeriockEffect | null>} Promise that resolves to the attunement effect or null.
   */
  async attune() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentAttune", data);
    if (!data.cancel) {
      return await attunement._attune(this);
    }
  }

  /**
   * Dampen this equipment.
   * @returns {Promise<void>}
   */
  async dampen() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentDampen", data);
    if (!data.cancel) {
      await this.parent.update({ "system.dampened": true });
    }
  }

  /**
   * Removes attunement from the equipment.
   * @returns {Promise<void>} Promise that resolves when the equipment is deattuned.
   */
  async deattune() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentDeattune", data);
    if (!data.cancel) {
      await attunement._deattune(this);
    }
  }

  /**
   * Equip this equipment.
   * @returns {Promise<void>}
   */
  async equip() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentEquip", data);
    if (!data.cancel) {
      await this.parent.update({ "system.equipped": true });
    }
  }

  /**
   * Glue this equipment.
   * @returns {Promise<void>}
   */
  async glue() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentGlue", data);
    if (!data.cancel) {
      await this.parent.update({ "system.glued": true });
    }
  }

  /**
   * Identifies the equipment, revealing all its properties.
   * @returns {Promise<void>} Promise that resolves when the equipment is identified.
   */
  async identify() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentIdentify", data);
    if (!data.cancel) {
      await identifying._identify(this);
    }
  }

  /** @inheritDoc */
  async parse(rawHTML) {
    return await parsing._parse(this, rawHTML);
  }

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    prepareModifiableBase(this.weight);
    prepareModifiableBase(this.av);
    prepareModifiableBase(this.bv);
    prepareModifiableBase(this.minStr);
    prepareModifiableBase(this.damage.base);
    prepareModifiableBase(this.damage.twoHanded);
    prepareModifiableBase(this.range.long);
    prepareModifiableBase(this.range.short);
    if (this.damage.base.saved.trim() === "0") {
      this.damage.base.raw = "";
    }
    //if (this.damage.twoHanded.saved.trim() === "0") {
    //  this.damage.twoHanded.raw = "";
    //}
    this.piercing = {
      av0: false,
      ub: false,
    };
    this.warded = false;
    this.hookedMacros =
      /** @type {Teriock.Parameters.Equipment.HookedEquipmentMacros} */ {};
    for (const pseudoHook of Object.keys(propertyPseudoHooks)) {
      this.hookedMacros[pseudoHook] = [];
    }
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    prepareModifiableBase(this.tier);
    deriveModifiableNumber(this.weight, { min: 0 });
    this.weight.total = this.weight.value;
    if (this.consumable) {
      this.weight.total = this.weight.value * this.quantity;
    }
    deriving._prepareDerivedData(this);
  }

  /** @inheritDoc */
  prepareSpecialData() {
    deriveModifiableNumber(this.av, {
      floor: true,
      min: 0,
    });
    deriveModifiableNumber(this.bv, {
      floor: true,
      min: 0,
    });
    deriveModifiableNumber(this.minStr, { min: -3 });
    deriveModifiableDeterministic(this.tier, this.actor);
    deriveModifiableIndeterministic(this.damage.base);
    deriveModifiableIndeterministic(this.damage.twoHanded);
    deriveModifiableDeterministic(this.range.long, this.actor);
    deriveModifiableDeterministic(this.range.short, this.actor);
    if (this.piercing.ub) {
      this.piercing.av0 = true;
    }
    if (!this.hasTwoHandedAttack) {
      this.damage.twoHanded.value = this.damage.base.value;
    }
  }

  /**
   * Reads magic on the equipment to reveal its properties.
   * @returns {Promise<void>} Promise that resolves when magic reading is complete.
   */
  async readMagic() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentReadMagic", data);
    if (!data.cancel) {
      await identifying._readMagic(this);
    }
  }

  /**
   * Repair this equipment.
   * @returns {Promise<void>}
   */
  async repair() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentRepair", data);
    if (!data.cancel) {
      await this.parent.update({ "system.shattered": false });
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

  /**
   * Shatter this equipment.
   * @returns {Promise<void>}
   */
  async shatter() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentShatter", data);
    if (!data.cancel) {
      await this.parent.update({ "system.shattered": true });
    }
  }

  /**
   * Undampen this equipment.
   * @returns {Promise<void>}
   */
  async undampen() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentUndampen", data);
    if (!data.cancel) {
      await this.parent.update({ "system.dampened": false });
    }
  }

  /**
   * Unequip this equipment.
   * @returns {Promise<void>}
   */
  async unequip() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentUnequip", data);
    if (!data.cancel) {
      await this.parent.update({ "system.equipped": false });
    }
  }

  /**
   * Unglue this equipment.
   * @returns {Promise<void>}
   */
  async unglue() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentUnglue", data);
    if (!data.cancel) {
      await this.parent.update({ "system.glued": false });
    }
  }

  /**
   * Removes identification from the equipment.
   * @returns {Promise<void>} Promise that resolves when the equipment is unidentified.
   */
  async unidentify() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentUnidentify", data);
    if (!data.cancel) {
      await identifying._unidentify(this);
    }
  }
}
