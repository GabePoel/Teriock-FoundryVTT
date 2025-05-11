const { HandlebarsApplicationMixin } = foundry.applications.api;
import { TeriockItemSheet } from "./teriock-item-sheet.mjs";
import { cleanAv, cleanBv, cleanStr, cleanDamage } from "../helpers/clean.mjs";

export class TeriockEquipmentSheet extends HandlebarsApplicationMixin(TeriockItemSheet) {
    static DEFAULT_OPTIONS = {
        classes: ['teriock', 'equipment', 'ability'],
        actions: {
            onEditImage: this._onEditImage,
            onChat: this._onChat,
            createAbility: this._createAbility,
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
        context.enrichedSpecialRules = await this._editor(this.item.system.specialRules);
        return context;
    }

    static async _onChat(event, target) {
        this.item.share();
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