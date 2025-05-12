const { HandlebarsApplicationMixin } = foundry.applications.api;
import { TeriockItemSheet } from './teriock-item-sheet.mjs';
import { powerContextMenu } from './context-menus/power-context-menus.mjs';
import { documentOptions } from "../helpers/constants/document-options.mjs";

export class TeriockPowerSheet extends HandlebarsApplicationMixin(TeriockItemSheet) {
    static DEFAULT_OPTIONS = {
        classes: ['teriock', 'power', 'ability'],
        actions: {
            onEditImage: this._onEditImage,
            onChat: this._onChat,
            createAbility: this._createAbility,
        },
        form: {
            submitOnChange: true,
        },
        window: {
            // resizable: true,
            icon: "fa-solid fa-" + documentOptions.power.icon,
        }
    };
    static PARTS = {
        header: {
            template: 'systems/teriock/templates/common/header.hbs',
        },
        all: {
            template: 'systems/teriock/templates/sheets/power-template/power-template.hbs',
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
        const powerContextMenuOptions = powerContextMenu(this.item);
        this._connectContextMenu('.power-box', powerContextMenuOptions, 'click');
    }
}