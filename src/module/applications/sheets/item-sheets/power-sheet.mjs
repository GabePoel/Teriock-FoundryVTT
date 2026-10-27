import SimpleItemSheet from "./simple-item-sheet.mjs";

/**
 * Power sheet.
 * @property {TeriockItem<"backstory"|"blessing"|"pact"|"power">} document
 */
export default class PowerSheet extends SimpleItemSheet {
  /** @type {string[]} */
  static BARS = ["teriock/sheets/items/power/status-bar", "teriock/sheets/shared/bars/stat-bar"];
}
