const { sheets, ux } = foundry.applications
import { openWikiPage } from "../helpers/wiki.mjs";
import { cleanFeet, cleanPounds, cleanPlusMinus, cleanMp, cleanHp } from "../helpers/clean.mjs";

export class TeriockItemSheet extends sheets.ItemSheet {
    static DEFAULT_OPTIONS = {
        classes: ['teriock'],
        actions: {
            onEditImage: this._onEditImage,
        },
        form: {
            submitOnChange: true,
        }
    }
    static PARTS = {
        all: {
            template: 'systems/teriock/templates/parts/header.hbs',
        },
    }

    async _editor(parameter) {
        return await ux.TextEditor.enrichHTML(parameter, {
            relativeTo: this.item,
        });
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
        };
    }

    _connectInput(element, attribute, callback) {
        const updateAttribute = (event) => {
            const target = event.currentTarget;
            const value = target.value;
            const newValue = callback(value);
            this.item.update({ [attribute]: newValue });
        };
        element.addEventListener('focusout', updateAttribute);
        element.addEventListener('change', updateAttribute);
        element.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                updateAttribute(event);
            }
        });
    }

    /** @override */
    _onRender(context, options) {
        this.element.querySelector('.reload-button').addEventListener('click', (event) => {
            event.preventDefault();
            console.log('Reloading wiki page');
            this.item._wikiPull();
        });
        this.element.querySelector('.open-button').addEventListener('click', (event) => {
            event.preventDefault();
            console.log('Opening wiki page');
            openWikiPage(this.item.system.wikiNamespace + ':' + this.item.name);
        });
        this.element.querySelector('.chat-button').addEventListener('click', (event) => {
            event.preventDefault();
            console.log('Sharing wiki page');
            this.item.share();
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
}