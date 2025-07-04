const { sheets, ux } = foundry.applications;
import { cleanFeet } from "../../../helpers/clean.mjs";
import { TeriockSheet } from "../../mixins/sheet-mixin.mjs";

/**
 * Base item sheet for Teriock system items.
 * Provides common functionality for all item sheets including drag and drop,
 * effect type management, and input cleaning.
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
    dragDrop: [{ dragSelector: ".draggable", dropSelector: null }],
  };
  /** @type {Array} */
  #dragDrop;

  /**
   * Creates a new base item sheet instance.
   * Initializes drag and drop handlers for the sheet.
   * @param {...any} args - Arguments to pass to the parent constructor.
   * @override
   */
  constructor(...args) {
    super(...args);
    this.#dragDrop = this.#createDragDropHandlers();
  }

  /**
   * Gets the drag and drop handlers for this sheet.
   * @returns {Array} Array of drag and drop handlers.
   */
  get dragDrop() {
    return this.#dragDrop;
  }

  /**
   * Prepares the context data for template rendering.
   * Builds and sorts effect types including abilities, properties, fluencies, and resources.
   * @returns {Promise<object>} Promise that resolves to the context object.
   * @override
   */
  async _prepareContext(options) {
    const abilityTypeOrder = Object.keys(CONFIG.TERIOCK.abilityOptions.abilityType || {});
    const { effectTypes, effectKeys } = this.item.buildEffectTypes();
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
   * Sets up drag and drop, static events, and input cleaning.
   * @param {object} context - The render context.
   * @param {object} options - Render options.
   * @override
   */
  _onRender(context, options) {
    super._onRender(context, options);
    if (!this.editable) return;
    this.#dragDrop.forEach((d) => d.bind(this.element));

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

  /**
   * Checks if drag start is allowed.
   * @returns {boolean} True if drag start is allowed.
   */
  _canDragStart() {
    return this.editable;
  }

  /**
   * Checks if drag drop is allowed.
   * @returns {boolean} True if drag drop is allowed.
   */
  _canDragDrop() {
    return this.editable;
  }

  /**
   * Creates drag and drop handlers for the sheet.
   * @returns {Array} Array of configured drag and drop handlers.
   * @private
   */
  #createDragDropHandlers() {
    return this.options.dragDrop.map((config) => {
      config.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      config.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new ux.DragDrop(config);
    });
  }
}
