import { EquipmentPreviewModel } from "../../../data/models/preview-models/_module.mjs";
import BaseActorSheet from "./abstract/base-actor-sheet.mjs";

/**
 * Sheet for a {@link TeriockInventory}.
 * @property {TeriockInventory} actor
 * @property {TeriockInventory} document
 */
export default class InventorySheet extends BaseActorSheet {
  /**
   * @this {InventorySheet}
   * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
   */
  static async #previewGroupEquipment() {
    return [{ docs: this._childrenOfType("equipment"), empty: TERIOCK.config.document.equipment.plural }];
  }

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { classes: ["inventory"], position: { height: 600, width: 525 } };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = { all: { scrollable: [""], template: "teriock/sheets/actors/inventory/inventory" } };

  static PREVIEWS = {
    equipment: {
      addButton: { type: "equipment" },
      data: { display: { size: "small" } },
      groups: this.#previewGroupEquipment,
      model: EquipmentPreviewModel,
    },
  };
}
