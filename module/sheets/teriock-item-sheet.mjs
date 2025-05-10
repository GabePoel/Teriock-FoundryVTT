const { sheets, ux } = foundry.applications;
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
            name: this.item.name,
            img: this.item.img,
            flags: this.item.flags,
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
}