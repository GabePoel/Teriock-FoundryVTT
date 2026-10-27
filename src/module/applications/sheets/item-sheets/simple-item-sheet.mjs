import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * Simple item sheet.
 * @property {TeriockItem<"curse"|"familiar"|"scar">} document
 */
export default class SimpleItemSheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = ["teriock/sheets/shared/bars/status-bar", "teriock/sheets/shared/bars/stat-bar"];
}
