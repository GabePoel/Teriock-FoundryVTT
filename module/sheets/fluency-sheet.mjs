const { HandlebarsApplicationMixin } = foundry.applications.api;
import { TeriockItemSheet } from './teriock-item-sheet.mjs';
import { fieldContextMenu, tradecraftContextMenu } from './context-menus/fluency-context-menus.mjs';
import { documentOptions } from "../helpers/constants/document-options.mjs";

export class TeriockFluencySheet extends HandlebarsApplicationMixin(TeriockItemSheet) {
    static DEFAULT_OPTIONS = {
        classes: ['teriock', 'fluency', 'ability'],
        actions: {
            onEditImage: this._onEditImage, 
            onChat: this._onChat,
        },
        form: {
            submitOnChange: true,
        },
        window: {
            // resizable: true,
            icon: "fa-solid fa-" + documentOptions.fluency.icon,
        },
        position: {
            width: 560,
        },
    };
    static PARTS = {
        header: {
            template: 'systems/teriock/templates/common/header.hbs',
        },
        all: {
            template: 'systems/teriock/templates/sheets/fluency-template/fluency-template.hbs',
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