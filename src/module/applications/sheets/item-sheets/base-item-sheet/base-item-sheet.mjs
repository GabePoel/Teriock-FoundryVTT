import { cleanFeet } from "../../../../helpers/clean.mjs";
import { refreshDocuments } from "../../../../helpers/utils.mjs";
import { SheetMixin } from "../../mixins/_module.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;

/**
 * Base item sheet for Teriock system items.
 * Provides common functionality for all item sheets.
 *
 * @extends {ItemSheetV2}
 * @property {TeriockItem} document
 * @property {TeriockItem} item
 */
export default class TeriockBaseItemSheet extends SheetMixin(ItemSheetV2) {
  /**
   * Default sheet options.
   * @type {object}
   */
  static DEFAULT_OPTIONS = {
    classes: [ "teriock" ],
    actions: {
      toggleOnUseDoc: this._toggleOnUseDoc,
      refreshThis: this._refreshThis,
    },
    window: {
      controls: [
        {
          icon: "fa-solid fa-rotate-right",
          label: "Refresh",
          action: "refreshThis",
        },
      ],
    },
  };

  /**
   * Refresh each {@link TeriockEffect} embedded in this {@link TeriockItem}.
   * @returns {Promise<void>}
   * @private
   */
  static async _refreshThis() {
    const toRefresh = [
      ...this.document.abilities,
      ...this.document.properties,
    ];
    await refreshDocuments(toRefresh);
  }

  /**
   * Marks the {@link TeriockEffect} as being "on use" or not.
   * @param {MouseEvent} _event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when marked.
   * @private
   */
  static async _toggleOnUseDoc(_event, target) {
    const id = target.dataset.id;
    const onUseSet = this.document.system.onUse;
    if (onUseSet.has(id)) {
      onUseSet.delete(id);
    } else {
      onUseSet.add(id);
    }
    await this.document.update({ "system.onUse": onUseSet });
  }

  /**
   * Binds input cleaning handlers for specific input types.
   * Applies cleaning functions to inputs that need formatting (e.g., feet to meters).
   */
  _bindCleanInputs() {
    const cleanMap = {
      ".range-input": cleanFeet,
    };

    for (const [ selector, cleaner ] of Object.entries(cleanMap)) {
      this.element.querySelectorAll(selector).forEach((el) => {
        this._connectInput(el, el.getAttribute("name"), cleaner);
      });
    }
  }

  /**
   * Binds static event handlers for import and chat buttons.
   * Sets up context menu handlers for bulk wiki pull and debug functionality.
   */
  _bindStaticEvents() {
    const importBtn = this.element.querySelector(".import-button");
    const chatBtn = this.element.querySelector(".chat-button");

    importBtn?.addEventListener("contextmenu", async (event) => {
      event.preventDefault();
      await this.item.bulkWikiPull();
    });

    chatBtn?.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.editable) {
      return;
    }

    this._bindStaticEvents();
    this._bindCleanInputs();
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    const abilityFormOrder = Object.keys(TERIOCK.options.ability.form || {});
    this.item.buildEffectTypes();
    const abilities = this.item.abilities.sort((a, b) => {
      const typeA = a.system?.form || "";
      const typeB = b.system?.form || "";
      const indexA = abilityFormOrder.indexOf(typeA);
      const indexB = abilityFormOrder.indexOf(typeB);
      if (indexA !== indexB) {
        return indexA - indexB;
      }
      return (a.name || "").localeCompare(b.name || "");
    });

    const propertyFormOrder = Object.keys(TERIOCK.options.ability.form || {});
    const properties = this.item.properties.sort((a, b) => {
      const typeA = a.system?.form || "";
      const typeB = b.system?.form || "";
      const indexA = propertyFormOrder.indexOf(typeA);
      const indexB = propertyFormOrder.indexOf(typeB);
      if (indexA !== indexB) {
        return indexA - indexB;
      }
      return (a.name || "").localeCompare(b.name || "");
    });

    const fluencies = this.item.fluencies.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    const resources = this.item.resources.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    const context = await super._prepareContext(options);
    context.item = this.item;
    context.properties = properties;
    context.abilities = abilities;
    context.fluencies = fluencies;
    context.resources = resources;
    context.baseEffects = this.document.effectTypes?.base || [];

    return context;
  }
}
