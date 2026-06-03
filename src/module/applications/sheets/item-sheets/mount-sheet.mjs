import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * Sheet for a {@link TeriockMount}.
 * @property {TeriockMount} document
 */
export default class MountSheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = ["teriock/sheets/shared/bars/stat-bar", "teriock/sheets/items/mount/status-bar"];
}
