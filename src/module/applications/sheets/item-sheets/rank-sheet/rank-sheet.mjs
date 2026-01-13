import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { makeIconClass, mix } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseItemSheet from "../base-item-sheet.mjs";
import {
  archetypeContextMenu,
  classContextMenu,
  rankContextMenu,
} from "./helpers/rank-context-menus.mjs";

/**
 * Sheet for a {@link TeriockRank}.
 * @extends {BaseItemSheet}
 * @mixes WikiButtonSheet
 * @property {TeriockRank} document
 * @property {TeriockRank} item
 */
export default class RankSheet extends mix(
  BaseItemSheet,
  mixins.WikiButtonSheetMixin,
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["rank"],
    window: {
      icon: makeIconClass(documentOptions.rank.icon, "title"),
    },
    actions: {
      toggleInnate: this.#onToggleInnate,
    },
  };

  /** @inheritDoc */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/item-templates/rank-template/rank-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /**
   * Toggle whether this is innate.
   * @returns {Promise<void>}
   */
  static async #onToggleInnate() {
    await this.document.update({
      "system.innate": !this.document.system.innate,
    });
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.isEditable) {
      return;
    }
    [
      {
        selector: ".rank-box",
        menu: rankContextMenu,
      },
      {
        selector: ".class-box",
        menu: classContextMenu,
      },
      {
        selector: ".archetype-box",
        menu: archetypeContextMenu,
      },
    ].forEach(({ selector, menu }) => {
      this._connectContextMenu(selector, menu(this.item), "click");
    });
  }
}
