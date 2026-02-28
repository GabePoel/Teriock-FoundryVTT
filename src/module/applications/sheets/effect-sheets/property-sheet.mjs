import { documentOptions } from "../../../constants/options/document-options.mjs";
import { systemPath } from "../../../helpers/path.mjs";
import { makeIconClass, mix } from "../../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";
import BaseEffectSheet from "./base-effect-sheet.mjs";

/**
 * {@link TeriockProperty} sheet.
 * @property {TeriockProperty} document
 * @extends {BaseEffectSheet}
 * @mixes WikiButtonSheet
 */
export default class PropertySheet extends mix(
  BaseEffectSheet,
  mixins.WikiButtonSheetMixin,
) {
  /** @inheritDoc */
  static BARS = [
    systemPath("templates/sheets/effects/property/status-bar.hbs"),
  ];

  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["property"],
    window: {
      icon: makeIconClass(documentOptions.property.icon, "title"),
    },
  };

  /** @inheritDoc */
  static PARTS = {
    ...this.HEADER_PARTS,
    menu: {
      template: systemPath("templates/sheets/effects/property/menu.hbs"),
    },
    ...this.CONTENT_PARTS,
  };

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.isEditable) {
      return;
    }
    this._connectBuildContextMenu(
      ".form-type-box",
      TERIOCK.options.ability.form,
      "system.form",
      "click",
    );
  }
}
