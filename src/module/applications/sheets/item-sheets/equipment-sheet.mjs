import documentConfig from "../../../constants/config/document-config.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";
import ArmamentSheet from "./armament-sheet.mjs";

/**
 * Sheet for a {@link TeriockEquipment}.
 * @extends {ArmamentSheet}
 * @property {TeriockEquipment} document
 * @property {TeriockEquipment} item
 * @mixes EquipmentDropSheet
 */
export default class EquipmentSheet extends mixClasses(ArmamentSheet, mixins.EquipmentDropSheetMixin) {
  /**
   * Toggles the dampened state of the equipment.
   * @returns {Promise<void>}
   */
  static async #onToggleDampened() {
    if (this.document.system.dampened) { await this.document.system.undampen(); }
    else { await this.document.system.dampen(); }
  }

  /**
   * Toggles the equipped state of the equipment.
   * @returns {Promise<void>}
   */
  static async #onToggleEquipped() {
    if (this.document.system.equipped) { await this.document.system.unequip(); }
    else { await this.document.system.equip(); }
  }

  /**
   * Toggles the glued state of the equipment.
   * @returns {Promise<void>}
   */
  static async #onToggleGlued() {
    if (this.document.system.glued) { await this.document.system.unglue(); }
    else { await this.document.system.glue(); }
  }

  /**
   * Toggles the shattered state of the equipment.
   * @returns {Promise<void>}
   */
  static async #onToggleShattered() {
    if (this.document.system.shattered) { await this.document.system.repair(); }
    else { await this.document.system.shatter(); }
  }

  /** @inheritDoc */
  static BARS = [
    "teriock/sheets/items/equipment/status-bar",
    ...super.BARS,
    "teriock/sheets/items/equipment/load-bar",
    "teriock/sheets/shared/bars/consumable-bar",
    "teriock/sheets/items/equipment/storage-bar",
  ];

  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    actions: {
      toggleDampened: this.#onToggleDampened,
      toggleEquipped: this.#onToggleEquipped,
      toggleGlued: this.#onToggleGlued,
      toggleShattered: this.#onToggleShattered,
    },
    classes: ["equipment"],
    window: { icon: makeIconClass(documentConfig.equipment.icon, "title") },
  };

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.isEditable) { return; }
    this._connectBuildContextMenu(
      ".power-level-box",
      TERIOCK.config.equipment.powerLevel,
      "system.powerLevel",
      "click",
    );
  }
}
