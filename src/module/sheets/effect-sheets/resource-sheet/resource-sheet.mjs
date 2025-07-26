const { api } = foundry.applications;
import { documentOptions } from "../../../helpers/constants/document-options.mjs";
import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";
import { callbackContextMenu } from "./connections/_context-menus.mjs";

/**
 * Resource sheet for Teriock system resources.
 * Provides resource management with context menus for callback functions.
 *
 * @extends {TeriockBaseEffectSheet}
 * @property {TeriockResource} document
 * @property {TeriockResource} effect
 */
export default class TeriockResourceSheet extends api.HandlebarsApplicationMixin(
  TeriockBaseEffectSheet,
) {
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
      template:
        "systems/teriock/src/templates/effect-templates/resource-template/resource-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /**
   * Handles the render event for the resource sheet.
   * Sets up context menu for function callback selection.
   * @override
   */
  async _onRender(options, context) {
    await super._onRender(options, context);
    this._connectContextMenu(
      ".function-box",
      callbackContextMenu(this.document),
      "click",
    );
  }
}
