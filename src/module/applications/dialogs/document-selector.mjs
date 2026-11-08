import { fromIdentifierLocal, fromQualifier, makeIconClass, resolveDocuments } from "../../utils/_module.mjs";
import ResolvableDialog from "../api/resolvable-dialog.mjs";

const { SearchFilter } = foundry.applications.ux;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/** @type {Teriock.Select.SelectDocumentsDialogOptions} */
const DEFAULT_SELECT_OPTIONS = {
  checked: [],
  hint: "",
  imgKey: "img",
  locked: [],
  multi: true,
  noDocumentsMessage: "TERIOCK.DIALOGS.SelectDocument.noOptions",
  nullable: false,
  openable: false,
  silent: false,
  textKey: null,
  title: "TERIOCK.DIALOGS.SelectDocument.defaults.title",
  tooltip: true,
};

export default class DocumentSelector extends ResolvableDialog {
  /**
   * Optionally resolve some documents.
   * @template T
   * @param {T[]} documents
   * @param {boolean} resolve
   * @returns {Promise<T>}
   */
  static async #optionalResolve(documents, resolve) {
    return resolve ? await resolveDocuments(documents) : documents;
  }

  /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { none: this._onNone, ok: { buttons: [0, 2], handler: this._onGetSelected } },
    classes: ["dynamic-select"],
    position: { width: 450 },
    window: {
      icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.select, "title"),
      title: "TERIOCK.DIALOGS.Select.Document.title",
    },
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
    return {
      ...DEFAULT_SELECT_OPTIONS,
      noDocumentsMessage: _loc(DEFAULT_SELECT_OPTIONS.noDocumentsMessage),
      title: _loc(DEFAULT_SELECT_OPTIONS.title),
      ...options,
    };
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
    if (event) { this.onConfirm?.(event); }
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
   * @returns {Promise<void>}
   * @this {DocumentSelector}
   */
  static async _onNone() {
    this._finish(this.multi ? [] : null);
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
    const getName = (doc) => doc.fullName || doc.name;
    documents.sort((a, b) => getName(a).localeCompare(getName(b)));
    if (!options.multi) { options.checked = options.checked.slice(0, 1); }
    for (const doc of documents) {
      const id = doc.uuid;
      idToDoc.set(id, doc);
      entries[id] = {
        checked: options.checked.includes(id),
        img: foundry.utils.getProperty(doc, options.imgKey),
        locked: options.locked.includes(id),
        name: getName(doc),
        text: options.textKey ? foundry.utils.getProperty(doc, options.textKey) || "" : "",
        uuid: doc.uuid,
      };
    }
    return { entries, idToDoc, options };
  }

  /**
   * @param {{ entries: Record<string, Teriock.Select.DocumentSelectionEntry>, options: Teriock.Select.SelectDocumentsDialogOptions }} prepared
   * @param {Partial<ApplicationConfiguration>} [config]
   * @returns {Promise<string[]|false|null>}
   */
  static async _promptPrepared(prepared, config = {}) {
    const app = new this(prepared.entries, prepared.options, config);
    await app.render(true);
    return app._result;
  }

  /**
   * Every document a selection config points to, without prompting for a selection.
   * @param {Teriock.Select.DocumentSelectionConfig} [config]
   * @returns {Promise<TeriockDocument[]>}
   */
  static async getFromConfig(config = {}) {
    const {
      expandFolders = true,
      expandTables = true,
      filter = () => true,
      globalIdentifiers = [],
      globalPacks = [],
      globalTypes = [],
      globalUuids = [],
      localIdentifiers = [],
      localQualifier = "",
      localUuids = [],
      relativeTo = null,
    } = config;
    const pending = [];
    if (relativeTo) {
      pending.push(
        ...Array.from(localUuids, uuid => foundry.utils.fromUuid(uuid, { relative: relativeTo })),
        ...Array.from(localIdentifiers, identifier => fromIdentifierLocal(identifier, relativeTo)),
      );
    }
    const local = (await Promise.all(pending)).filter(Boolean);
    const qualified = await fromQualifier(relativeTo, localQualifier);
    const global = [...Array.from(globalUuids), ...Array.from(globalIdentifiers)];
    const documents = await resolveDocuments([...global, ...local, ...qualified], { expandFolders, expandTables });
    const knownUuids = new Set(documents.map(d => d.uuid));
    for (const type of globalTypes) {
      documents.push(
        ...Object.values(game.teriock.identifiers.getEntries(type, { permission: "LIMITED" })).filter(v =>
          !knownUuids.has(v?.uuid)
        ),
      );
    }
    for (const packId of globalPacks) {
      const pack = game.packs.get(packId);
      if (!pack) { continue; }
      const index = await pack.getIndex();
      documents.push(...index.filter(i => !i.system?._sup && !knownUuids.has(i.uuid)));
    }
    return Array.from(new Set(documents)).filter(filter);
  }

  /**
   * Select documents from a config instead of a provided group of documents. No dialog if no choices.
   * @param {Teriock.Select.DocumentSelectionConfig} [config]
   * @param {Partial<Teriock.Select.SelectDocumentsDialogOptions>} [options]
   * @returns {Promise<TeriockDocument[]|null|false>} `false` if canceled and `null` if none was chosen in single mode
   */
  static async selectFromConfig(config = {}, options = {}) {
    const { all = false, auto = true, multi = false, random = false } = config;
    return this.selectMulti(await this.getFromConfig(config), { ...options, all, auto, multi, random, silent: true });
  }

  /**
   * Select any number of documents. No dialog if `all`, `auto`, or `random` settle the selection.
   * @template T
   * @param {Iterable<T>|T[]} documents
   * @param {Partial<Teriock.Select.SelectDocumentsDialogOptions>} [options]
   * @returns {Promise<T[]|null|false>} `false` if canceled and `null` if none was chosen in single mode
   */
  static async selectMulti(documents, options = {}) {
    const { all = false, auto = false, multi = true, random = false, resolve = false } = options;
    const choices = this._coerceDocuments(documents);
    if (choices.length) {
      if (multi && all) { return this.#optionalResolve(choices, resolve); }
      if (!multi && random) {
        return this.#optionalResolve([choices[Math.floor(Math.random() * choices.length)]], resolve);
      }
      if (auto && choices.length === 1) { return this.#optionalResolve(choices, resolve); }
    }
    const prepared = this._prepareDocuments(choices, { ...options });
    if (prepared.early !== undefined) { return this.#optionalResolve(prepared.early, resolve); }
    const selected = await this._promptPrepared(prepared);
    if (!selected) { return selected; }
    return this.#optionalResolve(selected.map(id => prepared.idToDoc.get(id)).filter(Boolean), resolve);
  }

  /**
   * Select one document.
   * @template T
   * @param {Iterable<T>|T[]} documents
   * @param {Partial<Teriock.Select.SelectDocumentDialogOptions>} [options]
   * @returns {Promise<T|null|false>} `false` if canceled
   */
  static async selectSingle(documents, options = {}) {
    const selected = await this.selectMulti(documents, {
      ...options,
      auto: options.auto ?? !options.nullable,
      checked: options.checked ? [options.checked] : [],
      locked: options.locked ? [options.locked] : [],
      multi: false,
    });
    if (selected === false) { return false; }
    return selected?.[0] ?? null;
  }

  /**
   * @param {Record<string, Teriock.Select.DocumentSelectionEntry>} documents
   * @param {Partial<Teriock.Select.SelectDocumentsDialogOptions>} options
   * @param {Partial<ApplicationConfiguration>} [config]
   */
  constructor(documents, options = {}, config = {}) {
    const { hint = "", multi = true, nullable = false, openable = false, tooltip = true } = options;
    super(config);
    this.documents = documents;
    this.multi = multi;
    this.nullable = nullable;
    this.hint = hint;
    this.tooltip = tooltip;
    this.openable = openable;
    this.onConfirm = options.onConfirm;
    if (options.title) { foundry.utils.setProperty(this.options, "window.title", options.title); }
    if (options.icon) { foundry.utils.setProperty(this.options, "window.icon", options.icon); }
    this.unchecked = !Object.values(documents).some(d => d.checked);
  }

  /** @inheritDoc */
  get _fallbackFinishValue() {
    return false;
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
    const context = await super._prepareContext(options);
    context.buttons[0].default = !this.unchecked;
    if (this.nullable) {
      context.buttons.push({
        action: "none",
        icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.remove, "button"),
        label: "TERIOCK.COMMON.None",
      });
    }
    return Object.assign(context, {
      documents: this.documents,
      hint: this.hint,
      multi: this.multi,
      tooltip: this.tooltip,
      unchecked: this.unchecked,
    });
  }
}
