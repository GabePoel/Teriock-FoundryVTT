import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { makeIconClass, mix } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";

/**
 * {@link TeriockProperty} sheet.
 * @property {TeriockProperty} document
 * @extends {TeriockBaseEffectSheet}
 * @mixes PassiveSheet
 * @mixes WikiButtonSheet
 */
export default class TeriockPropertySheet extends mix(
  TeriockBaseEffectSheet,
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
   * @static
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
    if (!this.editable) {
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
