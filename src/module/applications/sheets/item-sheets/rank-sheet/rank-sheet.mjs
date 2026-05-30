import documentConfig from "../../../../constants/config/document-config.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { makeIconClass } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseItemSheet from "../base-item-sheet.mjs";
import { archetypeContextMenu, classContextMenu } from "./helpers/rank-context-menus.mjs";

/**
 * Sheet for a {@link TeriockRank}.
 * @extends {BaseItemSheet}
 * @mixes WikiButtonSheet
 * @property {TeriockRank} document
 * @property {TeriockRank} item
 */
export default class RankSheet extends mixClasses(BaseItemSheet, mixins.WikiButtonSheetMixin) {
  /**
   * Toggle whether this is innate.
   * @returns {Promise<void>}
   */
  static async #onToggleInnate() {
    await this.document.update({ "system.innate": !this.document.system.innate });
  }

  /** @inheritDoc */
  static BARS = [
    "teriock/sheets/items/rank/class-bar",
    "teriock/sheets/shared/bars/stat-bar",
    "teriock/sheets/items/rank/restrictions-bar",
  ];

  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    actions: { toggleInnate: this.#onToggleInnate },
    classes: ["rank"],
    window: { icon: makeIconClass(documentConfig.rank.icon, "title") },
  };

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.isEditable) { return; }

    [{ menu: classContextMenu, selector: ".class-box" }, { menu: archetypeContextMenu, selector: ".archetype-box" }]
      .forEach(({ menu, selector }) => {
        this._connectContextMenu(selector, menu(this.item), "click");
      });
  }
}
