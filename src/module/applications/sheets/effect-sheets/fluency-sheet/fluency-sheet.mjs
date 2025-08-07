import { documentOptions } from "../../../../helpers/constants/document-options.mjs";
import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";
import { fieldContextMenu, tradecraftContextMenu } from "./connections/_context-menus.mjs";

/**
 * Fluency sheet for Teriock system fluencies.
 * Provides fluency management with context menus for fields and tradecrafts.
 *
 * @property {TeriockFluency} document
 */
export default class TeriockFluencySheet extends TeriockBaseEffectSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["fluency"],
    window: {
      icon: "fa-solid fa-" + documentOptions.fluency.icon,
    },
  };

  /**
   * Template parts configuration for the fluency sheet.
   * @type {object}
   * @static
   */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/effect-templates/fluency-template/fluency-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    [
      { selector: ".field-box", menu: fieldContextMenu },
      { selector: ".tradecraft-box", menu: tradecraftContextMenu },
    ].forEach(({ selector, menu }) => {
      this._connectContextMenu(selector, menu(this.document), "click");
    });
  }
}
