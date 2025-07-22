const { HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;
import { documentOptions } from "../../../helpers/constants/document-options.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";
import {
  archetypeContextMenu,
  classContextMenu,
  hitDieContextMenu,
  manaDieContextMenu,
  rankContextMenu,
} from "./connections/_context-menus.mjs";

/**
 * Rank sheet for Teriock system ranks.
 * Provides rank management with context menus for various rank components and die re-rolling functionality.
 * @extends {TeriockBaseItemSheet}
 */
export default class TeriockRankSheet extends HandlebarsApplicationMixin(TeriockBaseItemSheet) {
  /**
   * Default options for the rank sheet.
   * @type {object}
   * @static
   */
  static DEFAULT_OPTIONS = {
    classes: ["rank"],
    window: {
      icon: "fa-solid fa-" + documentOptions.rank.icon,
    },
  };

  /**
   * Template parts configuration for the rank sheet.
   * @type {object}
   * @static
   */
  static PARTS = {
    all: {
      template: "systems/teriock/src/templates/item-templates/rank-template/rank-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /**
   * Prepares the context data for template rendering.
   * Adds enriched text fields for rank descriptions and flaws.
   * @returns {Promise<object>} Promise that resolves to the context object.
   * @override
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.enrichedDescription = await this._editor(this.item.system.description);
    context.enrichedFlaws = await this._editor(this.item.system.flaws);
    return context;
  }

  /**
   * Handles the render event for the rank sheet.
   * Sets up context menus for rank components and die re-rolling functionality.
   * @param {object} context - The render context.
   * @param {object} options - Render options.
   * @override
   */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.editable) return;
    [
      { selector: ".rank-box", menu: rankContextMenu },
      { selector: ".class-box", menu: classContextMenu },
      { selector: ".archetype-box", menu: archetypeContextMenu },
      { selector: ".hit-die-box", menu: hitDieContextMenu },
      { selector: ".mana-die-box", menu: manaDieContextMenu },
    ].forEach(({ selector, menu }) => {
      this._connectContextMenu(selector, menu(this.item), "click");
    });
    [
      {
        selector: ".hit-die-box",
        confirmText: "Are you sure you want to re-roll how much HP you gain from this rank?",
        dieKey: "hitDie",
        updateKey: "hp",
      },
      {
        selector: ".mana-die-box",
        confirmText: "Are you sure you want to re-roll how much mana you gain from this rank?",
        dieKey: "manaDie",
        updateKey: "mp",
      },
    ].forEach(({ selector, confirmText, dieKey, updateKey }) => {
      const el = this.element.querySelector(selector);
      if (el) {
        el.addEventListener("contextmenu", async () => {
          const proceed = await DialogV2.confirm({
            content: confirmText,
            rejectClose: false,
            modal: true,
          });
          if (proceed) {
            const die = this.item.system[dieKey];
            const maxRoll = parseInt(die.slice(1), 10);
            const newValue = Math.floor(Math.random() * maxRoll) + 1;
            await this.item.update({ [`system.${updateKey}`]: newValue });
          }
        });
      }
    });
  }
}
