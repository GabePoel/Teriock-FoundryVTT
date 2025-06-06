const { api } = foundry.applications;
import { documentOptions } from "../../helpers/constants/document-options.mjs";
import { TeriockEffectSheet } from "../teriock-effect-sheet.mjs";
import { callbackContextMenu } from "../../helpers/context-menus/resource-context-menus.mjs";

export class TeriockResourceSheet extends api.HandlebarsApplicationMixin(TeriockEffectSheet) {
  static DEFAULT_OPTIONS = {
    classes: ['resource'],
    window: {
      icon: "fa-solid fa-" + documentOptions.resource.icon,
    },
  };

  static PARTS = {
    all: {
      template: 'systems/teriock/templates/sheets/resource-template/resource-template.hbs',
      scrollable: [
        '.window-content',
        '.tsheet-page',
        '.ab-sheet-everything',
      ],
    },
  };

  /** @override */
  _onRender() {
    super._onRender();
    this._connectContextMenu('.function-box', callbackContextMenu(this.document), 'click');
  }
}