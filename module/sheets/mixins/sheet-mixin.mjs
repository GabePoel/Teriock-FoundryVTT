const { utils } = foundry;
const { ux, api } = foundry.applications;
import { chatImage } from "../../helpers/utils.mjs";
import { createAbility, createResource, createProperty, createFluency } from "../../helpers/create-effects.mjs";
import { imageContextMenuOptions } from "../../helpers/context-menus/image-context-menu.mjs";
import connectEmbedded from "../../helpers/connect-embedded.mjs";

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
        reloadThis: this._reloadThis,
        toggleLockThis: this._toggleLockThis,
        wikiPullThis: this._wikiPullThis,
        wikiOpenThis: this._wikiOpenThis,
        toggleForceDisabledDoc: this._toggleForceDisabledDoc,
        quickToggle: this._quickToggle,
        useOneDoc: this._useOneDoc,
        createAbility: this._createAbility,
        createResource: this._createResource,
        createProperty: this._createProperty,
        createFluency: this._createFluency,
        toggleSwitch: this._toggleSwitch,
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
      this._locked = true;
    }

    /** @override */
    _onRender(context, options) {
      super._onRender(context, options);
      this.editable = this.isEditable && !this._locked;
      connectEmbedded(this.document, this.element, this.editable);
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

    /** @override */
    async _prepareContext() {
      const context = {
        config: CONFIG.TERIOCK,
        editable: this.editable,
        isEditable: this.isEditable,
        document: this.document,
        limited: this.document.limited,
        owner: this.document.isOwner,
        fields: this.document.schema.fields,
        system: this.document.system,
        systemFields: this.document.system.schema.fields,
        name: this.document.name,
        img: this.document.img,
        flags: this.document.flags,
        uuid: this.document.uuid,
      }
      return context;
    }

    async _chatImage(img) {
      await chatImage(img);
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
        } else if (this.document.documentName === 'ActiveEffect') {
          return this.document.parent?.effects.get(id);
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
      console.log('Debug', this.document, this);
    }

    static async _wikiPullThis(_, __) {
      if (this.editable) {
        console.log(`Clicking wiki pull for ${this.document.name}`);
        this.document.system.wikiPull();
      }
    }

    static async _wikiOpenThis(_, __) {
      this.document.system.wikiOpen();
    }

    static async _chatThis(_, __) {
      this.document.chat();
    }

    static async _toggleLockThis(_, __) {
      this._locked = !this._locked;
      this.editable = this.isEditable && !this._locked;
      this.render();
    }

    static async _rollThis(event, target) {
      const options = {};
      if (event?.altKey) options.advantage = true;
      else if (event?.shiftKey) options.disadvantage = true;
      this.document.use(options);
    }

    static async _reloadThis(_, __) {
      await this.document.update({});
      await this.document.sheet.render();
    }

    static async _editImage(_, target) {
      const attr = target.dataset.edit;
      const current = foundry.utils.getProperty(this.document, attr);
      const defaultImg = this.document.constructor.getDefaultArtwork?.(this.document.toObject())?.img;
      const picker = new foundry.applications.apps.FilePicker({
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
      this._embeddedFromCard(target)?.use(options);
    }

    static async _chatDoc(event, target) {
      this._embeddedFromCard(target)?.chat();
    }

    static async _useOneDoc(event, target) {
      this._embeddedFromCard(target)?.system.useOne();
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
      await createAbility(this.document, null);
    }

    static async _createResource(event, __) {
      await createResource(this.document, null);
    }

    static async _createFluency(event, __) {
      await createFluency(this.document, null);
    }

    static async _toggleSwitch(event, target) {
      const name = target.dataset.name;
      const value = target.dataset.value;
      let newValue;
      if (value == 0) {
        newValue = 1;
      } else if (value == 1) {
        newValue = -1;
      } else {
        newValue = 0;
      }
      this.document.update({
        [name]: newValue
      });
    }

    static async _createProperty(event, __) {
      const propertyKeys = Object.keys(CONFIG.TERIOCK.equipmentOptions.properties);
      const propertyValues = propertyKeys.map(
        (property) => `<option value="${property}">${CONFIG.TERIOCK.equipmentOptions.properties[property]}</option>`
      ).join('');
      const materialPropertyKeys = Object.keys(CONFIG.TERIOCK.equipmentOptions.materialProperties);
      const materialPropertyValues = materialPropertyKeys.map(
        (property) => `<option value="${property}">${CONFIG.TERIOCK.equipmentOptions.materialProperties[property]}</option>`
      ).join('');
      const magicalPropertyKeys = Object.keys(CONFIG.TERIOCK.equipmentOptions.magicalProperties);
      const magicalPropertyValues = magicalPropertyKeys.map(
        (property) => `<option value="${property}">${CONFIG.TERIOCK.equipmentOptions.magicalProperties[property]}</option>`
      ).join('');
      const propertyOptions = [
        ...propertyValues,
        ...materialPropertyValues,
        ...magicalPropertyValues
      ].join('');
      await new api.DialogV2({
        window: {
          title: "Create Property",
        },
        content: `
          <label for="property-select">Select Property</label>
          <select id="property-select" name="property">
            ${propertyOptions}
          </select>
        `,
        buttons: [{
          action: 'chosen',
          label: 'Add Chosen Property',
          default: true,
          callback: async (event, button, dialog) => {
            const value = button.form.elements.property.value;
            await createProperty(this.item, value);
          }
        },
        {
          action: 'other',
          label: 'Create New Property',
          default: false,
          callback: async (event, button, dialog) => {
            await createProperty(this.item, null);
          }
        }]
      }).render(true);
    }
  };