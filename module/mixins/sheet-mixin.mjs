const { ux } = foundry.applications;
import { connectEmbedded } from "../helpers/sheet-helpers.mjs";

export const TeriockSheet = (Base) => class TeriockSheet extends Base {
    static DEFAULT_OPTIONS = {
        actions: {
            editImage: this._editImage,
            openDoc: this._openDoc,
            rollDoc: this._rollDoc,
            chatDoc: this._chatDoc,
            chatThis: this._chatThis,
            toggleForceDisabledDoc: this._toggleForceDisabledDoc,
            quickToggle: this._quickToggle,
        }
    }

    /** @override */
    constructor(...args) {
        super(...args);
        this._menuOpen = false;
    }

    /** @override */
    _onRender(context, options) {
        super._onRender(context, options);
        connectEmbedded(this.actor, this.element);
    }

    static async _editImage(event, target) {
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

    static async _openDoc(event, target) {
        const doc = this._embeddedFromCard(target);
        doc.sheet.render(true);
    }

    static async _rollDoc(event, target) {
        const doc = this._embeddedFromCard(target);
        doc.roll();
    }

    static async _chatDoc(event, target) {
        const doc = this._embeddedFromCard(target);
        doc.chat();
    }

    static async _chatThis(event, target) {
        this.document.chat();
    }

    static async _toggleForceDisabledDoc(event, target) {
        const doc = this._embeddedFromCard(target);
        doc.toggleForceDisabled();
    }

    static async _quickToggle(event, target) {
        const path = target.dataset.path;
        const boolValue = target.dataset.bool === "true";
        this.document.update({ [path]: !boolValue });
    }

    async _editor(parameter) {
        if (parameter && parameter.length > 0) {
            return await ux.TextEditor.enrichHTML(parameter, {
                relativeTo: this.document,
            });
        }
    }

    _connect(cssClass, listener, callback) {
        const elements = this.element.querySelectorAll(cssClass);
        elements.forEach((element) => {
            element.addEventListener(listener, (event) => {
                event.preventDefault();
                callback(event);
            });
        });
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

    _embeddedFromCard(target) {
        const card = target.closest('.tcard');
        const id = card.dataset.id;
        const type = card.dataset.type;
        const parentId = card.dataset.parentId;
        console.log('Embedded from card', card, id, type, parentId);
        if (type === 'item') {
            return this.document.items.get(id);
        } else if (type === 'effect') {
            if (this.document.documentName === 'Actor' && parentId) {
                return this.document.items.get(parentId)?.effects.get(id);
            } else {
                return this.document.effects.get(id);
            }
        }
    }
}