const { api } = foundry.applications;
import { documentOptions } from "../../../helpers/constants/document-options.mjs";
import { fieldContextMenu, tradecraftContextMenu } from "./connections/_context-menus.mjs";
import TeriockBaseEffectSheet from "../base-sheet/base-sheet.mjs";

/**
 * Fluency sheet for Teriock system fluencies.
 * Provides fluency management with context menus for fields and tradecrafts.
 * @extends {TeriockBaseEffectSheet}
 */
export default class TeriockFluencySheet extends api.HandlebarsApplicationMixin(TeriockBaseEffectSheet) {
  /**
   * Default options for the fluency sheet.
   * @type {object}
   * @static
   */
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
      template: "systems/teriock/templates/sheets/fluency-template/fluency-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /**
   * Handles the render event for the fluency sheet.
   * Sets up context menus for field and tradecraft boxes.
   * @param {object} context - The render context.
   * @param {object} options - Render options.
   * @override
   */
  _onRender(context, options) {
    super._onRender(context, options);
    [
      { selector: ".field-box", menu: fieldContextMenu },
      { selector: ".tradecraft-box", menu: tradecraftContextMenu },
    ].forEach(({ selector, menu }) => {
      this._connectContextMenu(selector, menu(this.document), "click");
    });
  }
}
