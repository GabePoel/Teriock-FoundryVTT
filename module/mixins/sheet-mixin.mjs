const { ux } = foundry.applications;
const { utils } = foundry;
import { createAbility, createResource, createProperty } from "../helpers/create-effects.mjs";
import connectEmbedded from "./connect-embedded.mjs";
import { TeriockImage } from "../helpers/image.mjs";

export const TeriockSheet = (Base) =>
  class TeriockSheet extends Base {
    static DEFAULT_OPTIONS = {
      classes: ['teriock', 'ability'],
      actions: {
        debug: this._debug,
        editImage: this._editImage,
        openDoc: this._openDoc,
        rollDoc: this._rollDoc,
        chatDoc: this._chatDoc,
        chatThis: this._chatThis,
        rollThis: this._rollThis,
        wikiPullThis: this._wikiPullThis,
        wikiOpenThis: this._wikiOpenThis,
        toggleForceDisabledDoc: this._toggleForceDisabledDoc,
        quickToggle: this._quickToggle,
        useOneDoc: this._useOneDoc,
        createAbility: this._createAbility,
        createResource: this._createResource,
        createProperty: this._createProperty,
      },
      form: {
        submitOnChange: true,
        closeOnSubmit: false,
      },
      window: {
        resizable: true,
      },
      position: {
        width: 560,
        height: 600,
      },
    };

    constructor(...args) {
      super(...args);
      this._menuOpen = false;
      this._contextMenus = [];
    }

    /** @override */
    _onRender(context, options) {
      this.editable = this.isEditable && this.document.system.editable;
      super._onRender(context, options);
      connectEmbedded(this.document, this.element, this.editable);
      const imageContextMenuOptions = [
        {
          name: 'Open Image',
          icon: '<i class="fa-solid fa-image"></i>',
          callback: async (target) => {
            const img = target.getAttribute('data-src');
            const image = new TeriockImage(img);
            image.render(true);
          },
          condition: (target) => {
            const img = target.getAttribute('data-src');
            return img && img.length > 0;
          }
        },
        {
          name: 'Share Image',
          icon: '<i class="fa-solid fa-share"></i>',
          callback: async (target) => {
            const img = target.getAttribute('data-src');
            if (img && img.length > 0) {
              await this._chatImage(img);
            }
          },
        }
      ]
      new ux.ContextMenu(this.element, '.timage', imageContextMenuOptions, {
        eventName: 'contextmenu',
        jQuery: false,
        fixed: true,
      });
      this._connect('.chat-button', 'contextmenu', (e) => {
        TeriockSheet._debug.call(this, e, e.currentTarget);
      });
      this._activateMenu();
    }

    async _chatImage(img) {
      if (img) {
        await ChatMessage.create({
          content: `<div class="timage" data-src="${img}" style="display: flex; justify-content: center;"><img src="${img}" alt="${this.name}" class="teriock-image"></div>`,
          speaker: ChatMessage.getSpeaker({ actor: this.document }),
        })
      }
    }

    /** Editor */
    async _editor(parameter) {
      if (parameter?.length) {
        return await ux.TextEditor.enrichHTML(parameter, {
          relativeTo: this.document,
        });
      }
    }

    /** Menu Toggle */
    _activateMenu() {
      const menu = this.element.querySelector('.ab-menu');
      const toggle = this.element.querySelector('.ab-menu-toggle');

      if (menu && this._menuOpen) {
        menu.classList.add('no-transition', 'ab-menu-open');
        menu.offsetHeight;
        menu.classList.remove('no-transition');
        toggle?.classList.add('ab-menu-toggle-open');
      }

      this._connect('.ab-menu-toggle', 'click', () => {
        this._menuOpen = !this._menuOpen;
        menu?.classList.toggle('ab-menu-open', this._menuOpen);
        toggle?.classList.toggle('ab-menu-toggle-open', this._menuOpen);
      });
    }

    /** Utility: Connect DOM Events */
    _connect(selector, eventType, handler) {
      this.element.querySelectorAll(selector).forEach((el) =>
        el.addEventListener(eventType, (e) => {
          e.preventDefault();
          handler(e);
        })
      );
    }

    _connectInput(element, attribute, transformer) {
      const update = (e) => {
        const newValue = transformer(e.currentTarget.value);
        this.item.update({ [attribute]: newValue });
      };
      ['focusout', 'change'].forEach((evt) =>
        element.addEventListener(evt, update)
      );
      element.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') update(e);
      });
    }

    _connectButtonMap(map) {
      const html = $(this.element);
      for (const [selector, path] of Object.entries(map)) {
        html.on('click', selector, (e) => {
          e.preventDefault();
          this.document.update({ [path]: 'Insert effect here.' });
        });
      }
    }

    _connectCheckboxMap(map) {
      const html = $(this.element);
      for (const [selector, method] of Object.entries(map)) {
        html.on('click', selector, (e) => {
          e.preventDefault();
          this.document[method](e.currentTarget.checked);
        });
      }
    }

    _connectContextMenu(cssClass, options, eventName) {
      const menu = new ux.ContextMenu(this.element, cssClass, options, {
        eventName,
        jQuery: false,
        fixed: false,
      });
      return menu;
    }


    _embeddedFromCard(target) {
      const card = target.closest('.tcard');
      const { id, type, parentId } = card?.dataset ?? {};
      if (type === 'item') {
        return this.document.items.get(id);
      }
      if (type === 'effect') {
        if (this.document.documentName === 'Actor' && this.document._id !== parentId) {
          return this.document.items.get(parentId)?.effects.get(id);
        } else {
          return this.document.effects.get(id);
        }
      }
    }

    /** Drag and Drop */
    _onDragStart(event) {
      const embedded = this._embeddedFromCard(event.currentTarget);
      const dragData = embedded?.toDragData();
      if (dragData) {
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
      }
    }

    _onDragOver(_event) {
      // TODO: Provide visual feedback.
    }

    async _onDrop(event) {
      const data = await ux.TextEditor.getDragEventData(event);
      switch (data.type) {
        case 'ActiveEffect':
          return this._onDropActiveEffect(event, data);
        case 'Item':
          return this._onDropItem(event, data);
      }
    }

    async _onDropActiveEffect(event, data) {
      const effect = await getDocumentClass('ActiveEffect').fromDropData(data);
      if (!this.document.isOwner || !effect || effect.parent === this.document || effect.target === this.document) {
        return false;
      }
      if (!['Actor', 'Item'].includes(this.document.documentName)) {
        return false;
      }
      return this.document.createEmbeddedDocuments('ActiveEffect', [effect]);
    }

    async _onDropItem(event, data) {
      const item = await getDocumentClass('Item').fromDropData(data);
      if (!this.document.isOwner || !item || item.parent === this.document || this.document.documentName !== 'Actor') {
        return false;
      }

      const source = await utils.fromUuid(data.uuid);
      if (item.parent?.documentName === 'Actor' && item.type === 'equipment') {
        await source.delete();
      }
      return this.document.createEmbeddedDocuments('Item', [item]);
    }

    // Static Actions
    // ------------------------------------------------------------------------

    static async _debug(_, __) {
      console.log('Debug', this.document);
    }

    static async _wikiPullThis(_, __) {
      this.document.wikiPull();
    }

    static async _wikiOpenThis(_, __) {
      this.document.wikiOpen();
    }

    static async _chatThis(_, __) {
      this.document.chat();
    }

    static async _rollThis(event, target) {
      const options = {};
      if (event?.altKey) options.advantage = true;
      else if (event?.shiftKey) options.disadvantage = true;
      this.document.roll(options);
    }

    static async _editImage(_, target) {
      const attr = target.dataset.edit;
      const current = foundry.utils.getProperty(this.document, attr);
      const defaultImg = this.document.constructor.getDefaultArtwork?.(this.document.toObject())?.img;
      const picker = new FilePicker({
        current,
        type: 'image',
        redirectToRoot: defaultImg ? [defaultImg] : [],
        callback: (path) => this.document.update({ [attr]: path }),
        top: this.position.top + 40,
        left: this.position.left + 10,
      });
      return picker.browse();
    }

    static async _openDoc(event, target) {
      this._embeddedFromCard(target)?.sheet.render(true);
    }

    static async _rollDoc(event, target) {
      const options = {};
      if (event?.altKey) options.advantage = true;
      else if (event?.shiftKey) options.disadvantage = true;
      this._embeddedFromCard(target)?.roll(options);
    }

    static async _chatDoc(event, target) {
      this._embeddedFromCard(target)?.chat();
    }

    static async _useOneDoc(event, target) {
      this._embeddedFromCard(target)?.useOne();
    }

    static async _toggleForceDisabledDoc(event, target) {
      this._embeddedFromCard(target)?.toggleForceDisabled();
    }

    static async _quickToggle(event, target) {
      const path = target.dataset.path;
      const current = target.dataset.bool === "true";
      this.document.update({ [path]: !current });
    }

    static async _createAbility(event, __) {
      await createAbility(this.item, null);
    }

    static async _createResource(event, __) {
      await createResource(this.item, null);
    }

    static async _createProperty(event, __) {
      await createProperty(this.item, null);
    }
  };