import { createElement } from "../../../helpers/html.mjs";
import { BaseDataModel } from "../../abstract/_module.mjs";
import { TernaryField } from "../../fields/_module.mjs";

const { fields } = foundry.data;
const { SearchFilter } = foundry.applications.ux;

/**
 * Previews are used for sorting and filtering documents in sheets and are never stored to the database.
 * @property {Teriock.Models.PreviewDisplay} display
 * @property {Teriock.Models.BaseFilters} filters
 * @property {string} id
 * @property {Teriock.Models.PreviewSort} sort
 * @property {string} search
 * @property {Teriock.Previews.PreviewToggles} toggles
 */
export default class BasePreviewModel extends BaseDataModel {
  /**
   * Resolve a preview's add button config into the render context stored on the model.
   * @param {Teriock.Previews.PreviewAddButton} [add]
   * @param {TeriockDocumentSheet} app - The sheet the preview belongs to.
   * @returns {Teriock.Previews.PreviewAddButtonContext | null}
   */
  static #resolveAddButton(add, app) {
    if (!add) { return null; }
    const resolved = typeof add.types === "function" ? add.types(app) : add.types;
    const types = (resolved ?? (add.type ? [add.type] : []))?.filter(Boolean) ?? [];
    if (!types.length) { return null; }
    const dataType = add.type ?? (types.length === 1 ? types[0] : null);
    const tooltip = add.label
      ? _loc(add.label)
      : dataType
      ? _loc("TERIOCK.SHEETS.Common.PREVIEW.addType", { type: TERIOCK.config.document[dataType].label })
      : _loc("TERIOCK.SHEETS.Common.PREVIEW.addChildDocument");
    return { dataType, dataTypes: types.length > 1 ? types.join(",") : null, tooltip, types };
  }

  /**
   * The sort option selected by default. The `default` option preserves the order documents are passed in.
   * @returns {string}
   */
  static get defaultSortOption() {
    return "default";
  }

  /**
   * Choices for the sort option select.
   * @returns {Record<string, string>}
   */
  static get sortOrders() {
    return { default: "TERIOCK.SHEETS.Common.SORT.default", name: "TERIOCK.SHEETS.Common.SORT.name" };
  }

  /**
   * Build a preview model from a {@link Teriock.Previews.PreviewConfig}.
   * @param {string} id
   * @param {Teriock.Previews.PreviewConfig} config
   * @param {TeriockDocumentSheet} app
   * @returns {BasePreviewModel}
   */
  static create(id, config, app) {
    const Model = config.model ?? this;
    const preview = new Model({ ...config.data, id }, { parent: app.document });
    preview.add = BasePreviewModel.#resolveAddButton(config.addButton, app);
    return preview;
  }

  /**
   * The display fields.
   * @returns {Record<string, DataField>}
   */
  static defineDisplay() {
    return {
      gapless: new fields.BooleanField({
        hint: _loc("TERIOCK.SCHEMA.BlackGapless.hint"),
        initial: false,
        label: _loc("TERIOCK.SCHEMA.BlackGapless.label"),
      }),
      size: new fields.StringField({
        blank: false,
        choices: TERIOCK.config.display.sizes,
        hint: _loc("TERIOCK.SCHEMA.BlockSize.hint"),
        initial: "medium",
        label: _loc("TERIOCK.SCHEMA.BlockSize.label"),
        nullable: false,
        required: true,
      }),
    };
  }

  /**
   * The filter fields.
   * @returns {Record<string, DataField>}
   */
  static defineFilters() {
    return {
      active: new TernaryField({ label: _loc("TERIOCK.SHEETS.Common.TAGS.active") }),
      children: new TernaryField({ label: _loc("TERIOCK.CHANGES.Phase.children.label") }),
      duplicates: new TernaryField({ label: _loc("TERIOCK.TERMS.Common.duplicates") }),
      fluent: new TernaryField({ label: _loc("TERIOCK.SCHEMA.Competence.choices.2") }),
      proficient: new TernaryField({ label: _loc("TERIOCK.SCHEMA.Competence.choices.1") }),
    };
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      display: new fields.SchemaField(this.defineDisplay()),
      filters: new fields.SchemaField(this.defineFilters()),
      id: new fields.StringField(),
      search: new fields.StringField(),
      sort: new fields.SchemaField({
        ascending: new fields.BooleanField({ initial: true }),
        option: new fields.StringField({
          blank: false,
          choices: this.sortOrders,
          initial: this.defaultSortOption,
          required: true,
        }),
      }),
      toggles: new fields.SchemaField({
        block: new fields.BooleanField(),
        filter: new fields.BooleanField(),
        sort: new fields.BooleanField(),
      }),
    });
  }

  constructor(...args) {
    super(...args);
    this.#rootId = foundry.utils.randomID();
  }

  /** @type {string} */
  #rootId;

  /**
   * Whether a document's name matches the current search query.
   * @param {*} document
   * @param {RegExp|null} [rgx]
   * @returns {boolean}
   */
  #matchesSearch(document, rgx = this.#searchRegex()) {
    return !rgx || rgx.test(document?.name ?? "");
  }

  /**
   * Prepare an array of documents for rendering.
   * @template T
   * @param {T[]} documents
   * @returns {Teriock.Previews.RenderedPreviewEntry<T>[]}
   */
  #prepareDocuments(documents) {
    const docs = Array.isArray(documents) ? documents : [];
    const rgx = this.#searchRegex();
    const ordered = this.sortDocuments(docs);
    const visible = new Set(this.filterDocuments(docs));
    return ordered.map(doc => ({ doc, hidden: !visible.has(doc) || !this.#matchesSearch(doc, rgx) }));
  }

  /**
   * The regular expression matching the current search query.
   * @returns {RegExp|null}
   */
  #searchRegex() {
    const query = foundry.applications.ux.SearchFilter.cleanQuery(this.search ?? "");
    return query ? new RegExp(RegExp.escape(query), "i") : null;
  }

  /**
   * The add button, resolved once at creation by {@link create}, or `null` when the preview has no add button.
   * @type {Teriock.Previews.PreviewAddButtonContext | null}
   */
  add = null;

  /**
   * The raw group definitions for this preview, set by the sheet each render.
   * @type {Teriock.Previews.PreviewGroup[]}
   */
  groups = [];

  /** @inheritDoc */
  get _formPaths() {
    return [...this._formPathsSelect, ...this._formPathsTernary];
  }

  /**
   * Paths for fields that will be displayed as select inputs.
   * @returns {string[]}
   */
  get _formPathsSelect() {
    return [];
  }

  /**
   * Paths for fields that will be displayed as ternary inputs.
   * @returns {string[]}
   */
  get _formPathsTernary() {
    const paths = ["filters.active", "filters.duplicates", "filters.fluent", "filters.proficient"];
    if (this.relativeTo && this.relativeTo?.documentName === "Actor") { paths.push("filters.children"); }
    return paths;
  }

  /**
   * Map of sort options to accessor functions.
   * @returns {Record<string, (document: *) => string|number>}
   */
  get _sortMap() {
    return { name: d => d?.name ?? "" };
  }

  /**
   * The filter-menu form HTML for this preview.
   * @returns {string}
   */
  get filterForm() {
    return this._getEditorFormsSync().outerHTML;
  }

  /**
   * The document this is relative to.
   * @returns {AnyCommonDocument|null}
   */
  get relativeTo() {
    return this.parent;
  }

  /**
   * The groups to render, in DOM order.
   * @returns {Teriock.Previews.RenderedPreviewGroup[]}
   */
  get renderedGroups() {
    return (this.groups ?? []).filter(group => !group.optional || group.docs?.length).map(group => ({
      docs: this.#prepareDocuments(group.docs ?? []),
      empty: group.empty,
    }));
  }

  /**
   * Check a ternary filter.
   * @param {boolean|null} filter
   * @param {*} value
   * @returns {boolean}
   */
  _checkTernaryFilter(filter, value) {
    if (filter === null) { return true; }
    return (Boolean(filter) === Boolean(value));
  }

  /**
   * Check a value filter.
   * @param {string|number|null} filter
   * @param {*} value
   * @returns {boolean}
   */
  _checkValueFilter(filter, value) {
    if (filter === null || filter === "") { return true; }
    if (Array.isArray(value)) {
      return value.includes(filter);
    } else if (foundry.utils.getType(value) === "Set") {
      return value.has(filter);
    }
    return value === filter;
  }

  /** @inheritDoc */
  _getEditorFormsSync(config = {}) {
    const container = createElement("div", { className: "teriock-form-container" });
    for (const pathsArrays of [this._formPathsSelect, this._formPathsTernary]) {
      if (!pathsArrays.length) { continue; }
      const group = createElement("div", { className: "ttable" });
      this._makeFormGroups(pathsArrays, config).forEach(fg => group.append(fg));
      container.append(group);
    }
    return container;
  }

  /** @inheritDoc */
  _makeFormGroup(path, groupConfig = {}, inputConfig = {}, config = {}) {
    const group = super._makeFormGroup(
      path,
      { ...groupConfig, classes: ["teriock-sheet-multi-select-label"], rootId: this.#rootId },
      { ...inputConfig, dataset: { neverDisable: "true" }, name: `previews.${this.id}.${path}` },
      config,
    );
    const field = this.getFieldForProperty(path);
    if (
      field instanceof fields.StringField || field instanceof fields.NumberField || field instanceof fields.SetField
    ) {
      group.classList.remove("form-group");
      const label = group.querySelector("label");
      if (label) { label.className = "tsubtle"; }
    }
    const outerContainer = createElement("div", { className: "tgrid-item" });
    outerContainer.append(group);
    return outerContainer;
  }

  /**
   * Apply this preview in-place by editing the DOM.
   * @param {HTMLElement} element
   */
  apply(element) {
    const results = element?.querySelector(`.teriock-block-results[data-preview-search-key="${this.id}"]`);
    if (!results) { return; }
    const rendered = this.renderedGroups;
    const sizes = Object.keys(TERIOCK.config.display.sizes);
    results.querySelectorAll(":scope .teriock-block-container").forEach((container, i) => {
      const group = rendered[i];
      if (!group) { return; }
      const noResults = container.querySelector(":scope > .no-results");
      const cards = new Map();
      container.querySelectorAll(":scope > .teriock-block[data-uuid]").forEach(card =>
        cards.set(card.dataset.uuid, card)
      );
      for (const { doc, hidden } of group.docs) {
        const card = cards.get(doc.uuid);
        if (!card) { continue; }
        card.classList.toggle("hidden", hidden);
        container.insertBefore(card, noResults);
      }
      container.classList.toggle("gapless", this.display.gapless);
      for (const size of sizes) { container.classList.toggle(size, size === this.display.size); }
    });
  }

  /**
   * Bind this preview's interactive controls within the sheet element.
   * @param {HTMLElement} element - The sheet root element containing this preview.
   */
  bind(element) {
    if (!element) { return; }
    if (element.querySelector(`.teriock-block-search[data-preview-search-key="${this.id}"]`)) {
      new SearchFilter({
        contentSelector: `.teriock-block-results[data-preview-search-key="${this.id}"]`,
        initial: this.search,
        inputSelector: `.teriock-block-search[data-preview-search-key="${this.id}"]`,
        callback: (_event, query) => {
          this.updateSource({ search: query });
          this.apply(element);
        },
      }).bind(element);
    }
    element.querySelectorAll(`[name^="previews.${this.id}."]`).forEach(el => {
      el.addEventListener("change", e => {
        /** @type {AbstractFormInputElement} */
        const input = e.target;
        const value = input.type === "checkbox" ? input.checked : input.value;
        this.updateSource({ [input.name.split(".").slice(2).join(".")]: value });
        this.apply(element);
      });
    });
  }

  /**
   * Filter an array of documents.
   * @template T
   * @param {T[]} documents
   * @returns {Generator<T, void, void>}
   */
  *filterDocuments(documents) {
    // Special handling for the duplicates filter since it has different
    // behavior depending on if it's on or off. If it's on, then all duplicate
    // documents should be shown. If it's off, then only the first instance of
    // each document should be shown.
    const knownIdentifiers = new Set();
    const duplicateIdentifiers = new Set();
    if (this.filters.duplicates === true) {
      const identifierCounts = {};
      for (const document of documents) {
        const identifier = document?.typedIdentifier;
        if (identifier) {
          identifierCounts[identifier] = (identifierCounts[identifier] || 0) + 1;
          if (identifierCounts[identifier] > 1) { duplicateIdentifiers.add(identifier); }
        }
      }
    }

    for (const document of documents) {
      let duplicateFilter = true;
      if (this.filters.duplicates === true) {
        // Show only the duplicate documents.
        duplicateFilter = duplicateIdentifiers.has(document?.typedIdentifier);
      } else if (this.filters.duplicates === false) {
        // Show only the first instance of any duplicate document.
        const identifier = document?.typedIdentifier;
        if (identifier) {
          duplicateFilter = !knownIdentifiers.has(identifier);
          knownIdentifiers.add(identifier);
        }
      }

      if (
        this._checkTernaryFilter(this.filters.active, document?.active)
        && this._checkTernaryFilter(this.filters.proficient, document?.system?.competence?.proficient)
        && this._checkTernaryFilter(this.filters.fluent, document?.system?.competence?.fluent)
        && duplicateFilter
        && (!this.relativeTo
          || this._checkTernaryFilter(
            this.filters.children,
            document?.sup && (document?.sup?.uuid !== this.relativeTo?.uuid),
          ))
      ) {
        yield document;
      }
    }
  }

  /**
   * Sort an array of documents according to the current sort settings.
   * @template T
   * @param {T[]} documents
   * @returns {T[]}
   */
  sortDocuments(documents) {
    if (!Array.isArray(documents) || documents.length === 0) { return []; }
    const accessor = this._sortMap[this.sort.option];
    const sorted = accessor
      ? [...documents].sort((a, b) => {
        const aVal = accessor(a) ?? "";
        const bVal = accessor(b) ?? "";
        return typeof aVal === "number" ? aVal - bVal : String(aVal).localeCompare(String(bVal));
      })
      : [...documents];
    return this.sort.ascending ? sorted : sorted.reverse();
  }
}
