const { sheets } = foundry.applications;
import { cleanFeet } from "../../../helpers/clean.mjs";
import { TeriockSheet } from "../../mixins/sheet-mixin.mjs";

/**
 * Base item sheet for Teriock system items.
 * Provides common functionality for all item sheets.
 * @extends {ItemSheet}
 */
export default class TeriockBaseItemSheet extends TeriockSheet(sheets.ItemSheet) {
  /**
   * Default options for the base item sheet.
   * @type {object}
   * @static
   */
  static DEFAULT_OPTIONS = {
    classes: ["teriock"],
  };

  /**
   * Creates a new base item sheet instance.
   * @param {...any} args - Arguments to pass to the parent constructor.
   * @override
   */
  constructor(...args) {
    super(...args);
  }

  /**
   * Prepares the context data for template rendering.
   * Builds and sorts effect types including abilities, properties, fluencies, and resources.
   * @returns {Promise<object>} Promise that resolves to the context object.
   * @override
   */
  async _prepareContext(options) {
    const abilityTypeOrder = Object.keys(CONFIG.TERIOCK.abilityOptions.abilityType || {});
    const { effectTypes } = this.item.buildEffectTypes();
    const abilities =
      effectTypes.ability ||
      [].sort((a, b) => {
        const typeA = a.system?.abilityType || "";
        const typeB = b.system?.abilityType || "";
        const indexA = abilityTypeOrder.indexOf(typeA);
        const indexB = abilityTypeOrder.indexOf(typeB);
        if (indexA !== indexB) return indexA - indexB;
        return (a.name || "").localeCompare(b.name || "");
      });

    const propertyTypeOrder = Object.keys(CONFIG.TERIOCK.abilityOptions.abilityType || {});
    const properties =
      effectTypes.property ||
      [].sort((a, b) => {
        const typeA = a.system?.propertyType || "";
        const typeB = b.system?.propertyType || "";
        const indexA = propertyTypeOrder.indexOf(typeA);
        const indexB = propertyTypeOrder.indexOf(typeB);
        if (indexA !== indexB) return indexA - indexB;
        return (a.name || "").localeCompare(b.name || "");
      });

    const fluencies = effectTypes.fluency || [].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    const resources = effectTypes.resource || [].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    const context = await super._prepareContext(options);
    context.item = this.item;
    context.properties = properties;
    context.abilities = abilities;
    context.fluencies = fluencies;
    context.resources = resources;

    return context;
  }

  /**
   * Handles the render event for the item sheet.
   * @param {object} context - The render context.
   * @param {object} options - Render options.
   * @override
   */
  _onRender(context, options) {
    super._onRender(context, options);
    if (!this.editable) return;

    this._bindStaticEvents();
    this._bindCleanInputs();
  }

  /**
   * Binds static event handlers for import and chat buttons.
   * Sets up context menu handlers for bulk wiki pull and debug functionality.
   */
  _bindStaticEvents() {
    const importBtn = this.element.querySelector(".import-button");
    const chatBtn = this.element.querySelector(".chat-button");

    importBtn?.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      this.item._bulkWikiPull();
    });

    chatBtn?.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
  }

  /**
   * Binds input cleaning handlers for specific input types.
   * Applies cleaning functions to inputs that need formatting (e.g., feet to meters).
   */
  _bindCleanInputs() {
    const cleanMap = {
      ".range-input": cleanFeet,
    };

    for (const [selector, cleaner] of Object.entries(cleanMap)) {
      this.element.querySelectorAll(selector).forEach((el) => {
        this._connectInput(el, el.getAttribute("name"), cleaner);
      });
    }
  }
}
