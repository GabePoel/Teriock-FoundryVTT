import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * Power sheet.
 * @property {TeriockItem<"power">} document
 */
export default class PowerSheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = ["teriock/sheets/items/power/status-bar", "teriock/sheets/shared/bars/stat-bar"];
}
