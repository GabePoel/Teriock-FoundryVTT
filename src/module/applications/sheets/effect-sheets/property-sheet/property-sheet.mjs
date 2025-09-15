import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { PassiveSheetMixin } from "../../mixins/_module.mjs";
import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";
import { propertyContextMenu } from "./connections/_context-menus.mjs";

/**
 * Property sheet for Teriock system properties.
 * Provides property management with context menus for property types.
 *
 * @property {TeriockProperty} document
 * @extends {TeriockBaseEffectSheet}
 * @mixes PassiveSheetMixin
 */
export default class TeriockPropertySheet extends PassiveSheetMixin(TeriockBaseEffectSheet) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: [ "property" ],
    window: {
      icon: "fa-solid fa-" + documentOptions.property.icon,
    },
  };

  /**
   * Template parts configuration for the property sheet.
   * @type {object}
   * @static
   */
  static PARTS = {
    all: {
      template: "systems/teriock/src/templates/document-templates/effect-templates/property-template/property-template.hbs",
      scrollable: [
        ".window-content",
        ".tsheet-page",
        ".ab-sheet-everything",
      ],
    },
  };

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.editable) {
      return;
    }
    const propertyContextMenuOptions = propertyContextMenu(this.document);
    this._connectContextMenu(".property-type-box", propertyContextMenuOptions, "click");
    const buttonMap = {
      ".ab-limitation-button": "system.limitation",
      ".ab-improvement-button": "system.improvement",
    };
    this._connectButtonMap(buttonMap);
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.subProperties = this.document.subs;
    context.supProperty = this.document.sup;
    await this._enrichAll(context, {
      limitation: this.document.system.limitation,
      improvement: this.document.system.improvement,
    });
    return context;
  }
}
