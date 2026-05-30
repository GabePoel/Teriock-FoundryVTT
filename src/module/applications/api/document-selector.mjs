import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import TeriockResolvableDialog from "./resolvable-dialog.mjs";

const { SearchFilter } = foundry.applications.ux;

export default class TeriockDocumentSelector extends TeriockResolvableDialog {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    actions: { ok: this._onGetSelected },
    classes: ["dynamic-select"],
    position: { width: 450 },
    window: { icon: makeIconClass(icons.ui.select, "title"), title: "TERIOCK.DIALOGS.Select.Document.title" },
  };

  static PARTS = {
    all: { scrollable: [".doc-list-container"], template: "teriock/dialogs/document-selector" },
    footer: { template: "templates/generic/form-footer.hbs" },
  };

  /**
   * @param {PointerEvent} event
   * @returns {Promise<void>}
   * @this {TeriockDocumentSelector}
   */
  static async _onGetSelected(event) {
    event?.preventDefault();
    const root = this.element;
    let ids = [];
    if (this.multi) { ids = Array.from(root.querySelectorAll("input[type=\"checkbox\"]:checked")).map(el => el.name); }
    else {
      const radio = root.querySelector(`input[name="choice-${this.id}"]:checked`);
      if (radio) { ids = [radio?.value]; }
    }
    this._finish(ids);
    await this.close();
  }

  /**
   * @param {Record<string, Teriock.Select.DocumentSelectionEntry>} documents
   * @param {Partial<Teriock.Select.SelectDocumentsDialogOptions>} options
   * @param {Partial<ApplicationConfiguration>} [config]
   */
  constructor(documents, options = {}, config = {}) {
    const { hint = "", multi = true, openable = false, tooltip = true, tooltipAsync = false } = options;
    super(config);
    this.docs = documents;
    this.multi = multi;
    this.hint = hint;
    this.tooltip = tooltip;
    this.tooltipAsync = tooltipAsync;
    this.openable = openable;
    if (options.title) { foundry.utils.setProperty(this.options, "window.title", options.title); }
    if (options.icon) { foundry.utils.setProperty(this.options, "window.icon", options.icon); }
    this.config = foundry.utils.mergeObject(this.config ?? {}, this.options);
  }

  /** @inheritDoc */
  get _fallbackFinishValue() {
    return this.multi ? [] : super._fallbackFinishValue;
  }

  /**
   * Initialize double-click handling on the document list.
   */
  _initClickLoader() {
    if (!this.openable) { return; }
    const list = this.element.querySelector(".doc-list-container");
    list?.addEventListener("dblclick", this._onDblClickOpen.bind(this));
  }

  /**
   * Initialize the search filter.
   */
  _initSearchFilter() {
    const input = this.element.querySelector(".search-input");
    const content = this.element.querySelector(".doc-select");
    if (!input || !content) { return; }
    const searchFilter = new SearchFilter({
      contentSelector: ".doc-select",
      initial: "",
      inputSelector: ".search-input",
      callback: (_e, _q, rgx, container) => {
        container.querySelectorAll(".doc-select-item").forEach(/** @param {HTMLLIElement} card */ card => {
          const title = card.querySelector(".doc-name-container")?.textContent ?? "";
          const match = rgx ? rgx.test(title) : true;
          card.style.display = match ? "block" : "none";
        });
      },
    });
    searchFilter.bind(this.element);
  }

  /**
   * Open a document sheet when a row is double-clicked.
   * @param {MouseEvent} event
   */
  async _onDblClickOpen(event) {
    const row = /** @type {HTMLElement|null} */ event.target.closest("[data-uuid]");
    if (!row?.dataset.uuid) { return; }
    const doc = /** @type {AnyChildDocument} */ await fromUuid(row.dataset.uuid);
    await doc?.sheet?.render(true);
  }

  /** @inheritDoc */
  async _onRender(context, options = {}) {
    await super._onRender(context, options);
    this._initSearchFilter();
    this._initClickLoader();
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    return Object.assign(await super._prepareContext(options), {
      buttons: [{
        action: "ok",
        icon: makeIconClass(TERIOCK.display.icons.ui.done, "button"),
        label: "COMMON.Confirm",
        type: "submit",
      }],
      documents: this.docs,
      hint: this.hint,
      multi: this.multi,
      tooltip: this.tooltip,
      tooltipAsync: this.tooltipAsync,
    });
  }
}
