const { HandlebarsApplicationMixin } = foundry.applications.api;
import { cleanCapitalization } from "../../../helpers/clean.mjs";
import { documentOptions } from "../../../helpers/constants/document-options.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";
import { fontContextMenu, powerLevelContextMenu } from "./connections/_context-menus.mjs";

/**
 * Equipment sheet for Teriock system equipment.
 * Provides comprehensive equipment management including state toggles, context menus,
 * tag management, and rich text editing for equipment components.
 *
 * @extends {TeriockBaseItemSheet}
 * @property {TeriockEquipment} document
 * @property {TeriockEquipment} item
 */
export default class TeriockEquipmentSheet extends HandlebarsApplicationMixin(TeriockBaseItemSheet) {
  /**
   * Default options for the equipment sheet.
   * @type {object}
   * @static
   */
  static DEFAULT_OPTIONS = {
    classes: ["equipment"],
    actions: {
      toggleEquipped: this._toggleEquipped,
      toggleShattered: this._toggleShattered,
      toggleDampened: this._toggleDampened,
    },
    window: {
      icon: `fa-solid fa-${documentOptions.equipment.icon}`,
    },
  };

  /**
   * Template parts configuration for the equipment sheet.
   * @type {object}
   * @static
   */
  static PARTS = {
    all: {
      template: "systems/teriock/src/templates/item-templates/equipment-template/equipment-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /**
   * Toggles the equipped state of the equipment.
   * @returns {Promise<void>} Promise that resolves when equipped state is toggled.
   * @static
   */
  static async _toggleEquipped() {
    await this.document.update({ "system.equipped": !this.document.system.equipped });
  }

  /**
   * Toggles the shattered state of the equipment.
   * @returns {Promise<void>} Promise that resolves when shattered state is toggled.
   * @static
   */
  static async _toggleShattered() {
    await this.document.update({ "system.shattered": !this.document.system.shattered });
  }

  /**
   * Toggles the dampened state of the equipment.
   * @returns {Promise<void>} Promise that resolves when dampened state is toggled.
   * @static
   */
  static async _toggleDampened() {
    await this.document.update({ "system.dampened": !this.document.system.dampened });
  }

  /**
   * Prepares the context data for template rendering.
   * Adds enriched text fields for equipment descriptions and properties.
   * @returns {Promise<object>} Promise that resolves to the context object.
   * @override
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const { system } = this.item;

    const enrichments = {
      enrichedSpecialRules: system.specialRules,
      enrichedDescription: system.description,
      enrichedFlaws: system.flaws,
      enrichedNotes: system.notes,
    };

    for (const [key, value] of Object.entries(enrichments)) {
      context[key] = await this._editor(value);
    }

    return context;
  }

  /**
   * Handles the render event for the equipment sheet.
   * Sets up context menus, input cleaning, tag management, and button mappings.
   * @param {object} context - The render context.
   * @param {object} options - Render options.
   * @override
   */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.editable) return;

    const item = this.item;

    this._connectContextMenu(".power-level-box", powerLevelContextMenu(item), "click");
    this._connectContextMenu(".ab-title", fontContextMenu(item), "contextmenu");

    this.element.querySelectorAll(".capitalization-input").forEach((el) => {
      this._connectInput(el, el.getAttribute("name"), cleanCapitalization);
    });

    this._activateTags();
    const buttonMap = {
      ".ab-special-rules-button": "system.specialRules",
      ".ab-description-button": "system.description",
      ".ab-flaws-button": "system.flaws",
      ".ab-notes-button": "system.notes",
    };
    this._connectButtonMap(buttonMap);
  }

  /**
   * Activates tag management for equipment flags and properties.
   * Sets up click handlers for boolean flags, array tags, and static updates.
   */
  _activateTags() {
    const doc = this.document;
    const root = this.element;

    const flagTags = {
      ".flag-tag-glued": "system.glued",
    };

    for (const [selector, path] of Object.entries(flagTags)) {
      root.querySelectorAll(selector).forEach((el) => {
        el.addEventListener("click", async (e) => {
          e.preventDefault();
          await doc.update({ [path]: false });
        });
      });
    }

    const arrayTags = {
      ".equipment-class-tag": "equipmentClasses",
      ".property-tag": "properties",
      ".magical-property-tag": "magicalProperties",
      ".material-property-tag": "materialProperties",
    };

    for (const [selector, path] of Object.entries(arrayTags)) {
      root.querySelectorAll(selector).forEach((el) => {
        el.addEventListener("click", async () => {
          const val = el.getAttribute("value");
          const current = doc.system[path].filter((v) => v !== val);
          await doc.update({ [`system.${path}`]: current });
        });
      });
    }

    const staticUpdates = {
      ".ab-damage-button": { "system.damage": 2 },
      ".ab-two-handed-damage-button": { "system.twoHandedDamage": this.item.system.damage },
      ".ab-short-range-button": { "system.shortRange": 5 },
      ".ab-range-button": { "system.range": 5 },
      ".ab-av-button": { "system.av": 1 },
      ".ab-bv-button": { "system.bv": 1 },
      ".ab-weight-button": { "system.weight": 1 },
      ".ab-tier-button": { "system.tier.raw": "1" },
    };

    for (const [selector, update] of Object.entries(staticUpdates)) {
      root.querySelectorAll(selector).forEach((el) => {
        el.addEventListener("click", () => doc.update(update));
      });
    }

    const dampenedEls = root.querySelectorAll(".flag-tag-dampened");
    dampenedEls.forEach((el) => el.addEventListener("click", () => doc.system.undampen()));

    const shatteredEls = root.querySelectorAll(".flag-tag-shattered");
    shatteredEls.forEach((el) => el.addEventListener("click", () => doc.system.repair()));
  }
}
