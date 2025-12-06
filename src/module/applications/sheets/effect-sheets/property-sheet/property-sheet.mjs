import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { makeIconClass } from "../../../../helpers/utils.mjs";
import {
  PassiveSheetMixin,
  WikiButtonSheetMixin,
} from "../../mixins/_module.mjs";
import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";
import { propertyContextMenu } from "./connections/_context-menus.mjs";

/**
 * {@link TeriockProperty} sheet.
 * @property {TeriockProperty} document
 * @extends {TeriockBaseEffectSheet}
 * @mixes PassiveSheet
 * @mixes WikiButtonSheet
 */
export default class TeriockPropertySheet extends WikiButtonSheetMixin(
  PassiveSheetMixin(TeriockBaseEffectSheet),
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
    const propertyContextMenuOptions = propertyContextMenu(this.document);
    this._connectContextMenu(
      ".property-type-box",
      propertyContextMenuOptions,
      "click",
    );
  }
}
