import { documentOptions } from "../../../../helpers/constants/document-options.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";
import { powerContextMenu } from "./connections/_context-menus.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Power sheet for Teriock system powers.
 * Provides power management with proficiency toggling, context menus, and rich text editing.
 * @extends {TeriockBaseItemSheet}
 */
export default class TeriockPowerSheet extends HandlebarsApplicationMixin(
  TeriockBaseItemSheet,
) {
  /**
   * Default options for the power sheet.
   * @type {object}
   * @static
   */
  static DEFAULT_OPTIONS = {
    classes: ["power"],
    actions: {
      toggleProficient: this._toggleProficient,
    },
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
        "systems/teriock/src/templates/item-templates/power-template/power-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /**
   * Toggles the proficient state of the power.
   * @returns {Promise<void>} Promise that resolves when proficient state is toggled.
   * @static
   */
  static async _toggleProficient() {
    if (this.editable) {
      await this.item.update({
        "system.proficient": !this.item.system.proficient,
      });
    }
  }

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
    context.enrichedFlaws = await this._editor(this.item.system.flaws);
    return context;
  }

  /**
   * Handles the render event for the power sheet.
   * Sets up context menu for power type selection.
   * @param {object} context - The render context.
   * @param {object} options - Render options.
   * @override
   */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.editable) return;
    const powerContextMenuOptions = powerContextMenu(this.item);
    this._connectContextMenu(".power-box", powerContextMenuOptions, "click");
  }
}
