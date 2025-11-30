import { cleanFeet } from "../../../../helpers/clean.mjs";
import { refreshDocuments } from "../../../../helpers/utils.mjs";
import {
  ChatButtonSheetMixin,
  ChildSheetMixin,
  CommonSheetMixin,
} from "../../mixins/_module.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;

/**
 * Base item sheet for Teriock system items.
 * Provides common functionality for all item sheets.
 * @extends {ItemSheetV2}
 * @mixes ChatButtonSheet
 * @mixes CommonSheet
 * @mixes ChildSheet
 * @property {TeriockItem} document
 * @property {TeriockItem} item
 */
export default class TeriockBaseItemSheet extends ChatButtonSheetMixin(
  ChildSheetMixin(CommonSheetMixin(ItemSheetV2)),
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["teriock"],
    actions: {
      toggleOnUseDoc: this._toggleOnUseDoc,
      refreshThis: this._refreshThis,
    },
  };

  /**
   * Refresh each {@link TeriockEffect} embedded in this {@link TeriockItem}.
   * @returns {Promise<void>}
   * @private
   */
  static async _refreshThis() {
    const toRefresh = [...this.document.abilities, ...this.document.properties];
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
    if (!this.editable) {
      foundry.ui.notifications.warn(
        `Cannot toggle if ability activates on use. Sheet is not editable.`,
      );
      return;
    }
    const id = target.dataset.id;
    const onUseSet = new Set(this.document.system.onUse);
    if (onUseSet.has(id)) {
      onUseSet.delete(id);
    } else {
      onUseSet.add(id);
    }
    await this.document.update({ "system.onUse": Array.from(onUseSet) });
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

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.editable) {
      return;
    }
    this._bindCleanInputs();
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    context.item = this.item;
    context.baseEffects = this.document.effectTypes?.base || [];
    return context;
  }
}
