import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * Mount sheet.
 * @property {TeriockItem<"mount">} document
 */
export default class MountSheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = ["teriock/sheets/items/mount/status-bar", "teriock/sheets/shared/bars/stat-bar"];
}
