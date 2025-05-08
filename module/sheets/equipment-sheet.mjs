const { api } = foundry.applications
import { TeriockItemSheet } from "./teriock-item-sheet.mjs"
import { cleanAv, cleanBv, cleanStr, cleanDamage } from "../helpers/clean.mjs"

export class TeriockEquipmentSheet extends api.HandlebarsApplicationMixin(TeriockItemSheet) {
    static DEFAULT_OPTIONS = {
        classes: ['teriock', 'equipment', 'ability'],
        actions: {
            onEditImage: this._onEditImage,
            onChat: this._onChat,
        },
        form: {
            submitOnChange: true,
        }
    }
    static PARTS = {
        header: {
            template: 'systems/teriock/templates/parts/header.hbs',
        },
        all: {
            template: 'systems/teriock/templates/equipment-template.hbs',
        }
    }

    /** @override */
    async _prepareContext() {
        const context = await super._prepareContext();
        // context.enrichedDamage = await this._editor(this.item.system.damage);
        context.enrichedSpecialRules = await this._editor(this.item.system.specialRules);
        return context;
    }

    static async _onChat(event, target) {
        this.item.share();
    }

    static async _onEditImage(event, target) {
        const attr = target.dataset.edit;
        const current = foundry.utils.getProperty(this.document, attr);
        const { img } =
            this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ??
            {};
        const fp = new FilePicker({
            current,
            type: 'image',
            redirectToRoot: img ? [img] : [],
            callback: (path) => {
                this.document.update({ [attr]: path });
            },
            top: this.position.top + 40,
            left: this.position.left + 10,
        });
        return fp.browse();
    }

    /** @override */
    _onRender(context, options) {
        super._onRender(context, options);
        this.element.querySelectorAll('.av-input').forEach((element) => {
            this._connectInput(element, element.getAttribute('name'), cleanAv);
        });
        this.element.querySelectorAll('.bv-input').forEach((element) => {
            this._connectInput(element, element.getAttribute('name'), cleanBv);
        });
        this.element.querySelectorAll('.str-input').forEach((element) => {
            this._connectInput(element, element.getAttribute('name'), cleanStr);
        });
        this.element.querySelectorAll('.damage-input').forEach((element) => {
            this._connectInput(element, element.getAttribute('name'), cleanDamage);
        });
    }
}