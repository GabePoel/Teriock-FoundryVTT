import { documentConfig } from "../../../constants/config/document-config.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";
import BaseEffectSheet from "./base-effect-sheet.mjs";

/**
 * {@link TeriockProperty} sheet.
 * @property {TeriockProperty} document
 * @extends {BaseEffectSheet}
 * @mixes WikiButtonSheet
 */
export default class PropertySheet extends mixClasses(BaseEffectSheet, mixins.WikiButtonSheetMixin) {
  /** @inheritDoc */
  static BARS = ["teriock/sheets/effects/property/status-bar", "teriock/sheets/shared/bars/consumable-bar"];

  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["property"],
    window: { icon: makeIconClass(documentConfig.property.icon, "title") },
  };

  /** @inheritDoc */
  static PARTS = {
    ...this.HEADER_PARTS,
    menu: { template: "teriock/sheets/effects/property/menu" },
    ...this.CONTENT_PARTS,
  };

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.isEditable) return;
    this._connectBuildContextMenu(".form-type-box", TERIOCK.config.effect.form, "system.form", "click");
  }
}
