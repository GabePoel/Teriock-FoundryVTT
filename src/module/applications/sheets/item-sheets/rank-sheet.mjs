import { RankClassUpdater, RankKindUpdater } from "../../dialogs/_module.mjs";
import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * Rank sheet.
 * @property {TeriockItem<"rank">} document
 */
export default class RankSheet extends ChildSheet {
  /**
   * Edit this rank's archetype and class.
   * @returns {Promise<void>}
   */
  static async #onUpdateClass() {
    if (!game.teriock.checkEditable(this)) { return; }
    await RankClassUpdater.create({ document: this.document });
  }

  /**
   * Edit where this rank came from.
   * @returns {Promise<void>}
   */
  static async #onUpdateKind() {
    if (!game.teriock.checkEditable(this)) { return; }
    await RankKindUpdater.create({ document: this.document });
  }

  /** @type {string[]} */
  static BARS = [
    "teriock/sheets/items/rank/class-bar",
    "teriock/sheets/shared/bars/stat-bar",
    "teriock/sheets/items/rank/restrictions-bar",
  ];

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { updateClass: this.#onUpdateClass, updateKind: this.#onUpdateKind },
    classes: ["rank"],
  };
}
