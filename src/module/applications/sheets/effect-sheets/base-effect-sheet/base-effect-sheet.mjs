import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { makeIconClass, mix } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * Base {@link TeriockActiveEffect} sheet.
 * @extends {ActiveEffectConfig}
 * @mixes ChangesSheet
 * @mixes ChatButtonSheet
 * @mixes ChildSheet
 * @mixes CommonSheet
 * @property {GenericActiveEffect} documentf
 */
export default class BaseEffectSheet extends mix(
  ActiveEffectConfig,
  mixins.CommonSheetMixin,
  mixins.ChildSheetMixin,
  mixins.ChatButtonSheetMixin,
  mixins.ChangesSheetMixin,
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["teriock", "effect"],
    window: {
      icon: makeIconClass(documentOptions.effect.icon, "title"),
    },
    actions: {
      toggleDisabledThis: this._onToggledDisabledThis,
    },
  };

  /**
   * Toggles the disabled state of the current effect.
   * @returns {Promise<void>}
   */
  static async _onToggledDisabledThis() {
    await this.document.update({ disabled: !this.document.disabled });
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    Object.assign(context, {
      disabled: this.document.disabled,
      transfer: this.document.transfer,
      isSuppressed: this.document.isSuppressed,
    });
    return context;
  }
}
