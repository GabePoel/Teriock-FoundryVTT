const { sheets, ux } = foundry.applications;
import { TeriockSheet } from "../mixins/sheet-mixin.mjs";
import { openWikiPage } from "../helpers/wiki.mjs";
import { cleanFeet, cleanPounds, cleanPlusMinus, cleanMp, cleanHp } from "../helpers/clean.mjs";
import { createAbility } from '../helpers/sheet-helpers.mjs';

export class TeriockItemSheet extends TeriockSheet(sheets.ItemSheet) {
    static DEFAULT_OPTIONS = {
        classes: ['teriock'],
        form: {
            submitOnChange: true,
        },
        position: {
            height: 600,
        },
        window: {
            resizable: true,
        }
    }
    static PARTS = {
        all: {
            template: 'systems/teriock/templates/common/header.hbs',
        },
    }

    /** @override */
    async _prepareContext() {
        return {
            config: CONFIG.TERIOCK,
            editable: this.isEditable,
            item: this.item,
            limited: this.document.limited,
            owner: this.document.isOwner,
            system: this.item.system,
            name: this.item.name,
            img: this.item.img,
            flags: this.item.flags,
            abilities: this.item.transferredEffects.filter((effect) => effect.type === 'ability'),
        };
    }

    /** @override */
    _onRender(context, options) {
        this.element.querySelector('.reload-button').addEventListener('click', (event) => {
            event.preventDefault();
            console.log('Reloading wiki page');
            this.item.wikiPull();
        });
        this.element.querySelector('.reload-button').addEventListener('contextmenu', (event) => {
            event.preventDefault();
            console.log('Reloading wiki page');
            this.item._bulkWikiPull();
        });
        this.element.querySelector('.chat-button').addEventListener('contextmenu', (event) => {
            event.preventDefault();
            console.log('Debugging');
            console.log(this.item);
        });
        this.element.querySelectorAll('.range-input').forEach((element) => {
            this._connectInput(element, element.getAttribute('name'), cleanFeet);
        });
        this.element.querySelectorAll('.weight-input').forEach((element) => {
            this._connectInput(element, element.getAttribute('name'), cleanPounds);
        });
        this.element.querySelectorAll('.plus-minus-input').forEach((element) => {
            this._connectInput(element, element.getAttribute('name'), cleanPlusMinus);
        });
        this.element.querySelectorAll('.mp-input').forEach((element) => {
            this._connectInput(element, element.getAttribute('name'), cleanMp);
        });
        this.element.querySelectorAll('.hp-input').forEach((element) => {
            this._connectInput(element, element.getAttribute('name'), cleanHp);
        });
    }

    _connectContextMenu(cssClass, options, eventName) {
        const container = this.element;
        new foundry.applications.ux.ContextMenu(container, cssClass, options, {
            eventName: eventName,
            jQuery: false,
            fixed: false,
        });
    }

    static async _createAbility(event, target) {
        await createAbility(this.item, null);
        console.log(this.item);
    }
}