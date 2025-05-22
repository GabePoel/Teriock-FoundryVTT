const { sheets, ux } = foundry.applications;
import { TeriockSheet } from "../mixins/sheet-mixin.mjs";
import { openWikiPage } from "../helpers/wiki.mjs";
import {
    cleanFeet,
    cleanPounds,
    cleanPlusMinus,
    cleanMp,
    cleanHp
} from "../helpers/clean.mjs";

export class TeriockItemSheet extends TeriockSheet(sheets.ItemSheet) {
    static DEFAULT_OPTIONS = {
        classes: ['teriock'],
        dragDrop: [{ dragSelector: '.draggable', dropSelector: null }],
    };

    /** @override */
    constructor(...args) {
        super(...args);
        this.#dragDrop = this.#createDragDropHandlers();
    }

    /** @override */
    async _prepareContext() {
        const { item, document } = this;
        const { system, name, img, flags, transferredEffects } = item;

        return {
            config: CONFIG.TERIOCK,
            editable: this.isEditable,
            item,
            limited: document.limited,
            owner: document.isOwner,
            system,
            name,
            img,
            flags,
            abilities: transferredEffects.filter(e => e.type === 'ability'),
            resources: transferredEffects.filter(e => e.type === 'resource'),
        };
    }

    /** @override */
    _onRender(context, options) {
        super._onRender(context, options);
        this.#dragDrop.forEach(d => d.bind(this.element));

        this._bindStaticEvents();
        this._bindCleanInputs();
    }

    _bindStaticEvents() {
        const reloadBtn = this.element.querySelector('.reload-button');
        const chatBtn = this.element.querySelector('.chat-button');

        reloadBtn?.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.item._bulkWikiPull();
        });

        chatBtn?.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }

    _bindCleanInputs() {
        const cleanMap = {
            '.range-input': cleanFeet,
        };

        for (const [selector, cleaner] of Object.entries(cleanMap)) {
            this.element.querySelectorAll(selector).forEach((el) => {
                this._connectInput(el, el.getAttribute('name'), cleaner);
            });
        }
    }

    _canDragStart() {
        return this.isEditable;
    }

    _canDragDrop() {
        return this.isEditable;
    }

    get dragDrop() {
        return this.#dragDrop;
    }

    #dragDrop;

    #createDragDropHandlers() {
        return this.options.dragDrop.map((config) => {
            config.permissions = {
                dragstart: this._canDragStart.bind(this),
                drop: this._canDragDrop.bind(this),
            };
            config.callbacks = {
                dragstart: this._onDragStart.bind(this),
                dragover: this._onDragOver.bind(this),
                drop: this._onDrop.bind(this),
            };
            return new ux.DragDrop(config);
        });
    }
}
