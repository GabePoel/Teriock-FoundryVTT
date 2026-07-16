import documentConfig from "../../../constants/config/document-config.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import { RankClassUpdater, RankOriginUpdater } from "../../dialogs/_module.mjs";
import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * Sheet for a {@link TeriockRank}.
 * @extends {ChildSheet}
 * @property {TeriockRank} document
 */
export default class RankSheet extends ChildSheet {
  /**
   * Edit this rank's archetype and class.
   * @returns {Promise<void>}
   */
  static async #onEditClass() {
    if (!this.isEditable) { return; }
    await RankClassUpdater.create({ document: this.document });
  }

  /**
   * Edit where this rank came from.
   * @returns {Promise<void>}
   */
  static async #onEditOrigin() {
    if (!this.isEditable) { return; }
    await RankOriginUpdater.create({ document: this.document });
  }

  /** @type {string[]} */
  static BARS = [
    "teriock/sheets/items/rank/class-bar",
    "teriock/sheets/shared/bars/stat-bar",
    "teriock/sheets/items/rank/restrictions-bar",
  ];

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { editClass: this.#onEditClass, editOrigin: this.#onEditOrigin },
    classes: ["rank"],
    window: { icon: makeIconClass(documentConfig.rank.icon, "title") },
  };
}
