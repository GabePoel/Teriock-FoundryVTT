import { mix } from "../../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Base {@link TeriockItem} sheet.
 * @extends {ItemSheetV2}
 * @mixes ChatButtonSheet
 * @mixes CommonSheet
 * @mixes ChildSheet
 * @property {TeriockItem} document
 * @property {TeriockItem} item
 */
export default class BaseItemSheet extends mix(
  ItemSheetV2,
  HandlebarsApplicationMixin,
  mixins.CommonSheetMixin,
  mixins.ChildSheetMixin,
  mixins.ChatButtonSheetMixin,
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["teriock"],
    actions: {
      toggleOnUseDoc: this._onToggleOnUseDoc,
    },
  };

  /**
   * Marks the {@link TeriockActiveEffect} as being "on use" or not.
   * @param {MouseEvent} _event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>}
   */
  static async _onToggleOnUseDoc(_event, target) {
    if (!this.isEditable) {
      ui.notifications.warn(
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

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    context.item = this.item;
    context.baseEffects = this.document.effectTypes?.base || [];
    return context;
  }
}
