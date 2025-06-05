const { api } = foundry.applications;
import { fieldContextMenu, tradecraftContextMenu } from '../context-menus/fluency-context-menus.mjs';
import { documentOptions } from "../../helpers/constants/document-options.mjs";
import { TeriockEffectSheet } from "../teriock-effect-sheet.mjs";

export class TeriockFluencySheet extends api.HandlebarsApplicationMixin(TeriockEffectSheet) {
  static DEFAULT_OPTIONS = {
    classes: ['fluency'],
    window: {
      icon: "fa-solid fa-" + documentOptions.fluency.icon,
    },
  };
  static PARTS = {
    all: {
      template: 'systems/teriock/templates/sheets/fluency-template/fluency-template.hbs',
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
    [
      { selector: '.field-box', menu: fieldContextMenu },
      { selector: '.tradecraft-box', menu: tradecraftContextMenu }
    ].forEach(({ selector, menu }) => {
      this._connectContextMenu(selector, menu(this.document), 'click');
    });
  }
}