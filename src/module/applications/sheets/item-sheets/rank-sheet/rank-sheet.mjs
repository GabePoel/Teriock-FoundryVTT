import { documentOptions } from "../../../../constants/options/document-options.mjs";
import WikiButtonSheetMixin from "../../mixins/button-mixins/wiki-button-sheet-mixin.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";
import {
  archetypeContextMenu,
  classContextMenu,
  rankContextMenu,
} from "./connections/_context-menus.mjs";

/**
 * Sheet for a {@link TeriockRank}.
 *
 * @property {TeriockRank} document
 * @property {TeriockRank} item
 */
export default class TeriockRankSheet extends WikiButtonSheetMixin(
  TeriockBaseItemSheet,
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["rank"],
    window: {
      icon: "fa-solid fa-" + documentOptions.rank.icon,
    },
    actions: {
      toggleInnate: this._toggleInnate,
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
   * @private
   */
  static async _toggleInnate() {
    await this.document.update({
      "system.innate": !this.document.system.innate,
    });
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.editable) {
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

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    await this._enrichAll(context, {
      description: this.item.system.description,
      flaws: this.item.system.flaws,
    });
    return context;
  }
}
