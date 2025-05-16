const { api, sheets } = foundry.applications;
import { TeriockSheet } from "../mixins/sheet-mixin.mjs";
import { documentOptions } from "../helpers/constants/document-options.mjs";

export class TeriockResourceSheet extends api.HandlebarsApplicationMixin(TeriockSheet(sheets.ActiveEffectConfig)) {
    static DEFAULT_OPTIONS = {
        classes: ['teriock', 'resource', 'ability'],
        form: {
            submitOnChange: true,
            closeOnSubmit: false,
        },
        window: {
            // resizable: true,
            icon: "fa-solid fa-" + documentOptions.resource.icon,
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
            template: 'systems/teriock/templates/sheets/resource-template/resource-template.hbs',
        },
    };

    /** @override */
    async _prepareContext() {
        const context = {
            config: CONFIG.TERIOCK,
            editable: this.isEditable,
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
}