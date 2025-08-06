import { documentOptions } from "../../../../helpers/constants/document-options.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Mechanic sheet for Teriock system mechanics.
 *
 * @extends {TeriockBaseItemSheet}
 */
export default class TeriockMechanicSheet extends HandlebarsApplicationMixin(
  TeriockBaseItemSheet,
) {
  /**
   * Default options for the power sheet.
   * @type {object}
   * @static
   */
  static DEFAULT_OPTIONS = {
    classes: ["mechanic"],
    window: {
      icon: "fa-solid fa-" + documentOptions.power.icon,
    },
  };
  /**
   * Template rules-parts configuration for the power sheet.
   * @type {object}
   * @static
   */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/item-templates/mechanic-template/mechanic-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /**
   * Prepares the context data for template rendering.
   * Adds enriched text fields for power descriptions and flaws.
   * @returns {Promise<object>} Promise that resolves to the context object.
   * @override
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.enrichedDescription = await this._editor(
      this.item.system.description,
    );
    context.baseEffects = this.document.effectTypes.base;
    return context;
  }
}
