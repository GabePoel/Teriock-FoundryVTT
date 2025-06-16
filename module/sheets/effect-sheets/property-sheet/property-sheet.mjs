const { api } = foundry.applications;
import { documentOptions } from "../../../helpers/constants/document-options.mjs";
import { propertyContextMenu } from "../../../helpers/context-menus/property-context-menus.mjs";
import { TeriockBaseEffectSheet } from "../base-sheet/base-sheet.mjs";

export class TeriockPropertySheet extends api.HandlebarsApplicationMixin(TeriockBaseEffectSheet) {
  static DEFAULT_OPTIONS = {
    classes: ['property'],
    window: {
      icon: "fa-solid fa-" + documentOptions.property.icon,
    },
  };
  static PARTS = {
    all: {
      template: 'systems/teriock/templates/sheets/property-template/property-template.hbs',
      scrollable: [
        '.window-content',
        '.tsheet-page',
        '.ab-sheet-everything',
      ],
    },
  };

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    if (!this.editable) return;
    const propertyContextMenuOptions = propertyContextMenu(this.document);
    this._connectContextMenu('.property-type-box', propertyContextMenuOptions, 'click');
  }
}