const { api } = foundry.applications;
import { documentOptions } from "../../../helpers/constants/document-options.mjs";
import { propertyContextMenu } from "./connections/_context-menus.mjs";
import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";

/**
 * Property sheet for Teriock system properties.
 * Provides property management with context menus for property types.
 * @extends {TeriockBaseEffectSheet}
 */
export default class TeriockPropertySheet extends api.HandlebarsApplicationMixin(TeriockBaseEffectSheet) {
  /**
   * Default options for the property sheet.
   * @type {object}
   * @static
   */
  static DEFAULT_OPTIONS = {
    classes: ["property"],
    window: {
      icon: "fa-solid fa-" + documentOptions.property.icon,
    },
  };

  /**
   * Template parts configuration for the property sheet.
   * @type {object}
   * @static
   */
  static PARTS = {
    all: {
      template: "systems/teriock/templates/effect-templates/property-template/property-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /**
   * Handles the render event for the property sheet.
   * Sets up context menu for property type selection.
   * @param {object} context - The render context.
   * @param {object} options - Render options.
   * @override
   */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.editable) return;
    const propertyContextMenuOptions = propertyContextMenu(this.document);
    this._connectContextMenu(".property-type-box", propertyContextMenuOptions, "click");
  }
}
