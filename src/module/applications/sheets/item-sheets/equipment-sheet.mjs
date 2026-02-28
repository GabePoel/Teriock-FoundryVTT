import { documentOptions } from "../../../constants/options/document-options.mjs";
import { systemPath } from "../../../helpers/path.mjs";
import { makeIconClass, mix } from "../../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";
import ArmamentSheet from "./armament-sheet.mjs";

/**
 * Sheet for a {@link TeriockEquipment}.
 * @extends {ArmamentSheet}
 * @property {TeriockEquipment} document
 * @property {TeriockEquipment} item
 * @mixes EquipmentDropSheet
 */
export default class EquipmentSheet extends mix(
  ArmamentSheet,
  mixins.EquipmentDropSheetMixin,
) {
  /** @inheritDoc */
  static BARS = [
    systemPath("templates/sheets/items/equipment/status-bar.hbs"),
    ...super.BARS,
    systemPath("templates/sheets/items/equipment/load-bar.hbs"),
    systemPath("templates/sheets/shared/bars/consumable-bar.hbs"),
    systemPath("templates/sheets/items/equipment/storage-bar.hbs"),
  ];

  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["equipment"],
    actions: {
      toggleEquipped: this.#onToggleEquipped,
      toggleShattered: this.#onToggleShattered,
      toggleDampened: this.#onToggleDampened,
    },
    window: {
      icon: makeIconClass(documentOptions.equipment.icon, "title"),
    },
  };

  /** @inheritDoc */
  static PARTS = {
    ...this.HEADER_PARTS,
    menu: {
      template: systemPath("templates/sheets/items/equipment/menu.hbs"),
    },
    ...this.CONTENT_PARTS,
  };

  /**
   * Toggles the dampened state of the equipment.
   * @returns {Promise<void>}
   */
  static async #onToggleDampened() {
    if (this.document.system.dampened) {
      await this.document.system.undampen();
    } else {
      await this.document.system.dampen();
    }
  }

  /**
   * Toggles the equipped state of the equipment.
   * @returns {Promise<void>}
   */
  static async #onToggleEquipped() {
    if (this.document.system.equipped) {
      await this.document.system.unequip();
    } else {
      await this.document.system.equip();
    }
  }

  /**
   * Toggles the shattered state of the equipment.
   * @returns {Promise<void>}
   */
  static async #onToggleShattered() {
    if (this.document.system.shattered) {
      await this.document.system.repair();
    } else {
      await this.document.system.shatter();
    }
  }

  /** @inheritDoc */
  get _buttonUpdates() {
    return {
      ...super._buttonUpdates,
      ".ab-two-handed-damage-button": { "system.damage.twoHanded.raw": "1" },
      ".ab-short-range-button": { "system.range.short.raw": "5" },
      ".ab-range-button": { "system.range.long.raw": "5" },
      ".ab-weight-button": { "system.weight.raw": "1" },
      ".ab-tier-button": { "system.tier.raw": "1" },
    };
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.isEditable) return;
    this._connectBuildContextMenu(
      ".power-level-box",
      TERIOCK.options.equipment.powerLevel,
      "system.powerLevel",
      "click",
    );
  }
}
