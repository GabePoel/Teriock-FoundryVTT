const { ux } = foundry.applications;
const { utils } = foundry;
import { connectEmbedded } from "../helpers/sheet-helpers.mjs";
import { createAbility, createResource } from "../helpers/sheet-helpers.mjs";

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
            useOneDoc: this._useOneDoc,
            createAbility: this._createAbility,
            createResource: this._createResource,
        },
    }

    /** @override */
    constructor(...args) {
        super(...args);
        this._menuOpen = false;
    }

    /** @override */
    _onRender(context, options) {
        super._onRender(context, options);
        connectEmbedded(this.document, this.element);
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

    static async _useOneDoc(event, target) {
        const doc = this._embeddedFromCard(target);
        doc.useOne();
    }

    static async _chatThis(event, target) {
        this.document.chat();
    }

    static async _createAbility(event, target) {
        await createAbility(this.item, null);
    }

    static async _createResource(event, target) {
        await createResource(this.item, null);
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
            if (this.document.documentName === 'Actor' && this.document._id !== parentId) {
                return this.document.items.get(parentId)?.effects.get(id);
            } else {
                return this.document.effects.get(id);
            }
        }
    }


    // Drag and Drop
    // ------------------------------------------------------------------------

    _onDragStart(event) {
        console.log('Drag start', event);
        const embedded = this._embeddedFromCard(event.currentTarget);
        let dragData = embedded?.toDragData();
        if (!dragData) {
            return;
        }
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    }

    _onDragOver(event) { }

    async _onDrop(event) {
        const data = ux.TextEditor.getDragEventData(event);
        console.log('Drop', event, data);
        switch (data.type) {
            case 'ActiveEffect':
                return this._onDropActiveEffect(event, data);
            case 'Item':
                return this._onDropItem(event, data);
        }
    }

    async _onDropActiveEffect(event, data) {
        const effect = await getDocumentClass('ActiveEffect').fromDropData(data);
        if (!this.document.isOwner || !effect) return false;
        if (effect.target === this.document) return false;
        if (effect.parent === this.document) return false;
        if (!['Actor', 'Item'].includes(this.document.documentName)) return false;
        return this.document.createEmbeddedDocuments('ActiveEffect', [effect]);
    }

    async _onDropItem(event, data) {
        const item = await getDocumentClass('Item').fromDropData(data);
        if (item.parent === this.document) return false;
        if (!this.document.isOwner || !item) return false;
        if (!this.document.documentName === 'Actor') return false;

        const document = await utils.fromUuid(data.uuid);
        if (item.parent?.documentName === 'Actor' && item.type === 'equipment') {
            document.delete();
        }
        return this.document.createEmbeddedDocuments('Item', [item]);
    }
}