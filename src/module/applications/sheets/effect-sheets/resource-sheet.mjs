import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * {@link TeriockResource} sheet.
 * @extends {ChildSheet}
 * @property {TeriockResource} document
 */
export default class ResourceSheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = ["teriock/sheets/shared/bars/consumable-bar"];
}
