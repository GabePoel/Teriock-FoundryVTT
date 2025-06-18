// Allows for typing within mixin.
/** @import ItemSheet from "@client/applications/sheets/item-sheet.mjs"; */
const { sheets, ux } = foundry.applications;
import { cleanFeet } from "../../../helpers/clean.mjs";
import { TeriockSheet } from "../../mixins/sheet-mixin.mjs";

/**
 * @extends {ItemSheet}
 */
export default class TeriockBaseItemSheet extends TeriockSheet(sheets.ItemSheet) {
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

    const abilityTypeOrder = Object.keys(CONFIG.TERIOCK.abilityOptions.abilityType || {});
    const abilities = this.document.transferredEffects
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
    const properties = this.document.transferredEffects
      .filter(e => e.type === 'property')
      .sort((a, b) => {
        const typeA = a.system?.propertyType || '';
        const typeB = b.system?.propertyType || '';
        const indexA = propertyTypeOrder.indexOf(typeA);
        const indexB = propertyTypeOrder.indexOf(typeB);
        if (indexA !== indexB) return indexA - indexB;
        return (a.name || '').localeCompare(b.name || '');
      });

    const fluencies = this.document.transferredEffects
      .filter(e => e.type === 'fluency')
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const resources = this.document.transferredEffects
      .filter(e => e.type === 'resource')
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const context = await super._prepareContext();
    context.item = this.item;
    context.properties = properties;
    context.abilities = abilities;
    context.fluencies = fluencies;
    context.resources = resources;

    return context;
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
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
