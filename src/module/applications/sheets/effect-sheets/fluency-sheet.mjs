import { FluencyTradecraftUpdater } from "../../dialogs/_module.mjs";
import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * {@link TeriockFluency} sheet.
 * @extends {ChildSheet}
 * @property {TeriockFluency} document
 */
export default class FluencySheet extends ChildSheet {
  /**
   * Edit this fluency's field and tradecraft.
   * @returns {Promise<void>}
   */
  static async #onEditTradecraft() {
    if (!this.isEditable) { return; }
    await FluencyTradecraftUpdater.create({ document: this.document });
  }

  /** @type {string[]} */
  static BARS = ["teriock/sheets/effects/fluency/tradecraft-bar"];

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { actions: { editTradecraft: this.#onEditTradecraft } };
}
