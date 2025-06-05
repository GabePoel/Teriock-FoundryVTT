const { sheets, ux } = foundry.applications;
import { cleanFeet } from "../helpers/clean.mjs";
import { TeriockSheet } from "./sheet-mixin.mjs";

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

    const abilityTypeOrder = Object.keys(CONFIG.TERIOCK.abilityOptions.abilityType || {});
    const abilities = transferredEffects
      .filter(e => e.type === 'ability')
      .sort((a, b) => {
        const typeA = a.system?.abilityType || '';
        const typeB = b.system?.abilityType || '';
        const indexA = abilityTypeOrder.indexOf(typeA);
        const indexB = abilityTypeOrder.indexOf(typeB);
        if (indexA !== indexB) return indexA - indexB;
        return (a.name || '').localeCompare(b.name || '');
      });

    const propertyTypeOrder = Object.keys(CONFIG.TERIOCK.abilityOptions.abilityType || {});
    const properties = transferredEffects
      .filter(e => e.type === 'property')
      .sort((a, b) => {
        const typeA = a.system?.propertyType || '';
        const typeB = b.system?.propertyType || '';
        const indexA = propertyTypeOrder.indexOf(typeA);
        const indexB = propertyTypeOrder.indexOf(typeB);
        if (indexA !== indexB) return indexA - indexB;
        return (a.name || '').localeCompare(b.name || '');
      });

    const fluencies = transferredEffects
      .filter(e => e.type === 'fluency')
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const resources = transferredEffects
      .filter(e => e.type === 'resource')
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return {
      config: CONFIG.TERIOCK,
      isEditable: this.isEditable,
      editable: this.isEditable && document.system.editable,
      item,
      limited: document.limited,
      owner: document.isOwner,
      system,
      name,
      img,
      flags,
      properties,
      abilities,
      fluencies,
      resources,
    };
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    this.editable = (this.isEditable && this.document.system.editable);
    if (!this.editable) return;
    this.#dragDrop.forEach(d => d.bind(this.element));

    this._bindStaticEvents();
    this._bindCleanInputs();
  }

  _bindStaticEvents() {
    const importBtn = this.element.querySelector('.import-button');
    const chatBtn = this.element.querySelector('.chat-button');

    importBtn?.addEventListener('contextmenu', (event) => {
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
    return this.editable;
  }

  _canDragDrop() {
    return this.editable;
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
