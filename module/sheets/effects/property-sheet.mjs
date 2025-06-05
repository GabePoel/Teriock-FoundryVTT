const { api } = foundry.applications;
import { propertyContextMenu } from "../context-menus/property-context-menus.mjs";
import { documentOptions } from "../../helpers/constants/document-options.mjs";
import { TeriockEffectSheet } from "../teriock-effect-sheet.mjs";

export class TeriockPropertySheet extends api.HandlebarsApplicationMixin(TeriockEffectSheet) {
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
    this.editable = this.isEditable && this.document.system.editable;
    if (!this.editable) return;
    const propertyContextMenuOptions = propertyContextMenu(this.document);
    this._connectContextMenu('.property-type-box', propertyContextMenuOptions, 'click');
  }
}