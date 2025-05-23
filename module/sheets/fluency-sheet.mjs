const { HandlebarsApplicationMixin } = foundry.applications.api;
import { TeriockItemSheet } from './teriock-item-sheet.mjs';
import { fieldContextMenu, tradecraftContextMenu } from './context-menus/fluency-context-menus.mjs';
import { documentOptions } from "../helpers/constants/document-options.mjs";

export class TeriockFluencySheet extends HandlebarsApplicationMixin(TeriockItemSheet) {
    static DEFAULT_OPTIONS = {
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
        const context = await super._prepareContext();
        context.enrichedDescription = await this._editor(this.item.system.description);
        return context;
    }

    /** @override */
    _onRender(context, options) {
        super._onRender(context, options);
        const fieldContextMenuOptions = fieldContextMenu(this.item);
        this._connectContextMenu('.field-box', fieldContextMenuOptions, 'click');
        const tradecraftContextMenuOptions = tradecraftContextMenu(this.item);
        this._connectContextMenu('.tradecraft-box', tradecraftContextMenuOptions, 'click');
    }
}