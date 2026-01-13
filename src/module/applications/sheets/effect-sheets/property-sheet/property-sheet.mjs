import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { makeIconClass, mix } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";

/**
 * {@link TeriockProperty} sheet.
 * @property {TeriockProperty} document
 * @extends {BaseEffectSheet}
 * @mixes PassiveSheet
 * @mixes WikiButtonSheet
 */
export default class PropertySheet extends mix(
  BaseEffectSheet,
  mixins.PassiveSheetMixin,
  mixins.WikiButtonSheetMixin,
) {
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

  /**
   * Template parts configuration for the property sheet.
   * @type {object}
   */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/effect-templates/property-template/property-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.isEditable) {
      return;
    }
    this._connectBuildContextMenu(
      ".property-type-box",
      TERIOCK.options.ability.form,
      "system.form",
      "click",
    );
  }
}
