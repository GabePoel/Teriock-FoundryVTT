const { api, sheets } = foundry.applications;
import { TeriockSheet } from "../mixins/sheet-mixin.mjs";
import { fieldContextMenu, tradecraftContextMenu } from './context-menus/fluency-context-menus.mjs';
import { documentOptions } from "../helpers/constants/document-options.mjs";

export class TeriockFluencySheet extends api.HandlebarsApplicationMixin(TeriockSheet(sheets.ActiveEffectConfig)) {
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
  async _prepareContext() {
    const context = {
      config: CONFIG.TERIOCK,
      editable: this.isEditable && this.document.system.editable,
      document: this.document,
      limited: this.document.limited,
      owner: this.document.isOwner,
      system: this.document.system,
      name: this.document.name,
      img: this.document.img,
      flags: this.document.flags,
      disabled: this.document.disabled,
    };
    const system = this.document.system;
    context.enrichedDescription = await this._editor(system.description);
    return context;
  }

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