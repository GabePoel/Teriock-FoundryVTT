import BaseActorSheet from "../base-actor-sheet/base-actor-sheet.mjs";

/**
 * Sheet for a {@link TeriockInventory}.
 * @property {TeriockInventory} actor
 * @property {TeriockInventory} document
 */
export default class InventorySheet extends BaseActorSheet {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { classes: ["inventory"], position: { height: 600, width: 525 } };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = { all: { scrollable: [""], template: "teriock/sheets/actors/inventory/inventory" } };
}
