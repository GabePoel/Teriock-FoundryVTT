import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * Attunement sheet.
 * @property {TeriockActiveEffect<"attunement">} document
 */
export default class AttunementSheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = ["teriock/sheets/effects/attunement/status-bar"];
}
