const { HandlebarsApplicationMixin } = foundry.applications.api;
import { documentOptions } from "../../helpers/constants/document-options.mjs";
import { powerContextMenu } from '../../helpers/context-menus/power-context-menus.mjs';
import { TeriockItemSheet } from '../teriock-item-sheet.mjs';

export class TeriockPowerSheet extends HandlebarsApplicationMixin(TeriockItemSheet) {
  static DEFAULT_OPTIONS = {
    classes: ['power'],
    actions: {
      toggleProficient: this._toggleProficient,
    },
    window: {
      icon: "fa-solid fa-" + documentOptions.power.icon,
    },
  };
  static PARTS = {
    all: {
      template: 'systems/teriock/templates/sheets/power-template/power-template.hbs',
      scrollable: [
        '.window-content',
        '.tsheet-page',
        '.ab-sheet-everything',
      ],
    },
  };

  static async _toggleProficient() {
    if (this.document.system.editable) {
      await this.item.update({ 'system.proficient': !this.item.system.proficient });
    }
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext();
    context.enrichedDescription = await this._editor(this.item.system.description);
    context.enrichedFlaws = await this._editor(this.item.system.flaws);
    return context;
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    this.editable = (this.isEditable && this.document.system.editable);
    if (!this.editable) return;
    const powerContextMenuOptions = powerContextMenu(this.item);
    this._connectContextMenu('.power-box', powerContextMenuOptions, 'click');
  }
}