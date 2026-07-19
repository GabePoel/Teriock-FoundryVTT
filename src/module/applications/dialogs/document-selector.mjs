import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import ResolvableDialog from "../api/resolvable-dialog.mjs";

const { SearchFilter } = foundry.applications.ux;

/** @type {Teriock.Select.SelectDocumentsDialogOptions} */
const DEFAULT_SELECT_OPTIONS = {
  checked: [],
  hint: "",
  imgKey: "img",
  localize: true,
  multi: true,
  noDocumentsMessage: "TERIOCK.DIALOGS.SelectDocument.noOptions",
  openable: false,
  silent: false,
  textKey: null,
  title: "TERIOCK.DIALOGS.SelectDocument.defaults.title",
  tooltip: true,
};

export default class DocumentSelector extends ResolvableDialog {
  /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { ok: this._onGetSelected },
    classes: ["dynamic-select"],
    position: { width: 450 },
    window: { icon: makeIconClass(icons.ui.select, "title"), title: "TERIOCK.DIALOGS.Select.Document.title" },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    all: { scrollable: [".doc-list-container"], template: "teriock/dialogs/document-selector" },
    footer: { template: "templates/generic/form-footer.hbs" },
  };

  /**
   * @template T
   * @param {Iterable<T>|T[]} documents
   * @returns {T[]}
   */
  static _coerceDocuments(documents) {
    if (documents !== null && typeof documents === "object" && typeof documents[Symbol.iterator] === "function") {
      return Array.from(documents);
    }
    return /** @type {T[]} */ (documents);
  }

  /**
   * @param {Partial<Teriock.Select.SelectDocumentsDialogOptions>} [options]
   * @returns {Teriock.Select.SelectDocumentsDialogOptions}
   */
  static _normalizeOptions(options = {}) {
    options = { ...DEFAULT_SELECT_OPTIONS, ...options };
    if (options.localize) {
      options.noDocumentsMessage = _loc(options.noDocumentsMessage);
      options.title = _loc(options.title);
      options.hint = _loc(options.hint);
    }
    return options;
  }

  /**
   * @inheritDoc
   * @this {DocumentSelector}
   */
  static async _onDoubleClickOpenDocument(event, target) {
    if (!this.openable) { return; }
    return super._onDoubleClickOpenDocument(event, target);
  }

  /**
   * @param {PointerEvent} event
   * @returns {Promise<void>}
   * @this {DocumentSelector}
   */
  static async _onGetSelected(event) {
    event?.preventDefault();
    const root = this.element;
    let ids = [];
    if (this.multi) { ids = Array.from(root.querySelectorAll("input[type=\"checkbox\"]:checked")).map(el => el.name); }
    else {
      const radio = root.querySelector(`input[name]:checked`);
      if (radio) { ids = [radio?.value].filter(Boolean); }
    }
    this._finish(ids);
    await this.close();
  }

  /**
   * @param {Iterable<unknown>|unknown[]} documents
   * @param {Partial<Teriock.Select.SelectDocumentsDialogOptions>} options
   * @returns {{ early: [] }|{ entries: Record<string, Teriock.Select.DocumentSelectionEntry>, idToDoc: Map<string, unknown>, options: Teriock.Select.SelectDocumentsDialogOptions }}
   */
  static _prepareDocuments(documents, options = {}) {
    documents = this._coerceDocuments(documents);
    options = this._normalizeOptions(options);
    if (documents.length === 0 && !options.silent) {
      ui.notifications.warn(options.noDocumentsMessage);
      return { early: [] };
    }
    if (documents.length === 0) { return { early: [] }; }
    const idToDoc = new Map();
    /** @type {Record<string, Teriock.Select.DocumentSelectionEntry>} */
    const entries = {};
    documents.sort((a, b) => a.name.localeCompare(b.name));
    if (!options.multi && options.checked?.length > 0) { options.checked.length = 1; }
    for (const doc of documents) {
      const id = doc.uuid;
      idToDoc.set(id, doc);
      entries[id] = {
        checked: options.checked.includes(id),
        img: foundry.utils.getProperty(doc, options.imgKey),
        name: doc.name,
        text: options.textKey ? foundry.utils.getProperty(doc, options.textKey) || "" : "",
        uuid: doc.uuid,
      };
    }
    return { entries, idToDoc, options };
  }

  /**
   * @param {{ entries: Record<string, Teriock.Select.DocumentSelectionEntry>, options: Teriock.Select.SelectDocumentsDialogOptions }} prepared
   * @param {Partial<ApplicationConfiguration>} [config]
   * @returns {Promise<string[]|null>}
   */
  static async _promptPrepared(prepared, config = {}) {
    const app = new this(prepared.entries, prepared.options, config);
    await app.render(true);
    return app._result;
  }

  /**
   * Select any number of documents.
   * @template T
   * @param {Iterable<T>|T[]} documents
   * @param {Partial<Teriock.Select.SelectDocumentsDialogOptions>} [options]
   * @returns {Promise<T[]>}
   */
  static async selectMulti(documents, options = {}) {
    const prepared = this._prepareDocuments(documents, { ...options });
    if (prepared.early !== undefined) { return prepared.early; }
    const selected = await this._promptPrepared(prepared);
    if (selected) { return selected.map(id => prepared.idToDoc.get(id)).filter(Boolean); }
    return [];
  }

  /**
   * Select one document.
   * @template T
   * @param {Iterable<T>|T[]} documents
   * @param {Partial<Teriock.Select.SelectDocumentDialogOptions>} [options]
   * @returns {Promise<T|null>}
   */
  static async selectSingle(documents, options = {}) {
    const docArray = this._coerceDocuments(documents);
    if ((options.auto ?? true) && docArray.length === 1) { return docArray[0]; }
    if (options.silent && !docArray.length) { return null; }
    const selected = await this.selectMulti(documents, {
      ...options,
      checked: options.checked ? [options.checked] : [],
      multi: false,
    });
    return selected?.[0] ?? null;
  }

  /**
   * @param {Record<string, Teriock.Select.DocumentSelectionEntry>} documents
   * @param {Partial<Teriock.Select.SelectDocumentsDialogOptions>} options
   * @param {Partial<ApplicationConfiguration>} [config]
   */
  constructor(documents, options = {}, config = {}) {
    const { hint = "", multi = true, openable = false, tooltip = true } = options;
    super(config);
    this.documents = documents;
    this.multi = multi;
    this.hint = hint;
    this.tooltip = tooltip;
    this.openable = openable;
    if (options.title) { foundry.utils.setProperty(this.options, "window.title", options.title); }
    if (options.icon) { foundry.utils.setProperty(this.options, "window.icon", options.icon); }
    this.config = foundry.utils.mergeObject(this.config ?? {}, this.options);
    this.unchecked = !Object.values(documents).some(d => d.checked);
  }

  /** @inheritDoc */
  get _fallbackFinishValue() {
    return this.multi ? [] : super._fallbackFinishValue;
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
          card.classList.toggle("hidden", rgx ? !rgx.test(title) : false);
        });
      },
    });
    searchFilter.bind(this.element);
  }

  /** @inheritDoc */
  async _onRender(context, options = {}) {
    await super._onRender(context, options);
    this._initSearchFilter();
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
      documents: this.documents,
      hint: this.hint,
      multi: this.multi,
      tooltip: this.tooltip,
      unchecked: this.unchecked,
    });
  }
}
