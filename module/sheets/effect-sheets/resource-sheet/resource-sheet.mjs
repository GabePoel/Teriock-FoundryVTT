const { api } = foundry.applications;
import { callbackContextMenu } from "./connections/_context-menus.mjs";
import { documentOptions } from "../../../helpers/constants/document-options.mjs";
import TeriockBaseEffectSheet from "../base-sheet/base-sheet.mjs";

/**
 * Resource sheet for Teriock system resources.
 * Provides resource management with context menus for callback functions.
 * @extends {TeriockBaseEffectSheet}
 */
export default class TeriockResourceSheet extends api.HandlebarsApplicationMixin(TeriockBaseEffectSheet) {
  /**
   * Default options for the resource sheet.
   * @type {object}
   * @static
   */
  static DEFAULT_OPTIONS = {
    classes: ["resource"],
    window: {
      icon: "fa-solid fa-" + documentOptions.resource.icon,
    },
  };

  /**
   * Template parts configuration for the resource sheet.
   * @type {object}
   * @static
   */
  static PARTS = {
    all: {
      template: "systems/teriock/templates/sheets/resource-template/resource-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /**
   * Handles the render event for the resource sheet.
   * Sets up context menu for function callback selection.
   * @override
   */
  _onRender() {
    super._onRender();
    this._connectContextMenu(".function-box", callbackContextMenu(this.document), "click");
  }
}
