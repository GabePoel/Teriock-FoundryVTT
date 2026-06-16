import { createElement } from "../../../helpers/html.mjs";
import { TernaryField } from "../../fields/_module.mjs";
import { blockGaplessField, blockSizeField } from "../../fields/helpers/builders.mjs";
import EmbeddedDataModel from "../embedded-data-model.mjs";

const { fields } = foundry.data;

/**
 * @typedef {object} BaseFilters
 * @property {boolean|null} active
 * @property {boolean|null} children
 * @property {boolean|null} fluent
 * @property {boolean|null} proficient
 */

/**
 * @typedef {object} PreviewMenus
 * @property {boolean} block - Whether the block options menu is open.
 * @property {boolean} filter - Whether the filter menu is open.
 * @property {boolean} sort - Whether the sort menu is open.
 */

/**
 * @typedef {object} PreviewSort
 * @property {boolean} ascending
 * @property {string} option
 */

/**
 * @typedef {object} PreviewDisplay
 * @property {Teriock.Keys.CardDisplaySize} size
 * @property {boolean} gapless
 */

/**
 * @property {PreviewDisplay} display
 * @property {BaseFilters} filters
 * @property {PreviewMenus} menus
 * @property {PreviewSort} sort
 * @property {string} search
 */
export default class BasePreviewModel extends EmbeddedDataModel {
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
   * The display fields.
   * @returns {Record<string, DataField>}
   */
  static defineDisplay() {
    return { gapless: blockGaplessField(), size: blockSizeField() };
  }

  /**
   * The filter fields.
   * @returns {Record<string, DataField>}
   */
  static defineFilters() {
    return {
      active: new TernaryField({ label: _loc("TERIOCK.SHEETS.Common.TAGS.active") }),
      children: new TernaryField({ label: _loc("TERIOCK.CHANGES.Phase.children.label") }),
      fluent: new TernaryField({ label: _loc("TERIOCK.SCHEMA.Competence.choices.2") }),
      proficient: new TernaryField({ label: _loc("TERIOCK.SCHEMA.Competence.choices.1") }),
    };
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      display: new fields.SchemaField(this.defineDisplay()),
      filters: new fields.SchemaField(this.defineFilters()),
      menus: new fields.SchemaField({
        block: new fields.BooleanField({ initial: false }),
        filter: new fields.BooleanField({ initial: false }),
        sort: new fields.BooleanField({ initial: false }),
      }),
      name: new fields.StringField(),
      search: new fields.StringField(),
      sort: new fields.SchemaField({
        ascending: new fields.BooleanField({ initial: true }),
        option: new fields.StringField({ choices: this.sortOrders, initial: this.defaultSortOption }),
      }),
    });
  }

  constructor(...args) {
    super(...args);
    this.#rootId = foundry.utils.randomID();
  }

  /** @type {string} */
  #rootId;

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
    const paths = ["filters.active"];
    if (this.relativeTo) { paths.push("filters.children"); }
    paths.push("filters.proficient", "filters.fluent");
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
   * The document this is relative to.
   * @returns {AnyCommonDocument|null}
   */
  get relativeTo() {
    return this.parent;
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
  _getEditorFormsSync() {
    const container = createElement("div", { className: "teriock-form-container" });
    for (const pathsArrays of [this._formPathsSelect, this._formPathsTernary]) {
      if (!pathsArrays.length) { continue; }
      const group = createElement("div", { className: "ttable" });
      this._makeFormGroups(pathsArrays).forEach(fg => group.append(fg));
      container.append(group);
    }
    return container;
  }

  /** @inheritDoc */
  _makeFormGroup(path, groupConfig = {}, inputConfig = {}) {
    const group = super._makeFormGroup(path, {
      ...groupConfig,
      classes: ["ab-multi-select-label"],
      rootId: this.#rootId,
    }, {
      ...inputConfig,
      dataset: { neverDisable: "true" },
      name: `previewMenus.${this.name}.${path}`,
      value: foundry.utils.getProperty(this, path),
    });
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
   * Filter an array of documents.
   * @template T
   * @param {T[]} documents
   * @returns {Generator<T, void, void>}
   */
  *filterDocuments(documents) {
    for (const document of documents) {
      if (
        this._checkTernaryFilter(this.filters.active, document?.active)
        && this._checkTernaryFilter(this.filters.proficient, document?.system?.competence?.proficient)
        && this._checkTernaryFilter(this.filters.fluent, document?.system?.competence?.fluent)
        && (!this.relativeTo
          || this._checkTernaryFilter(
            this.filters.children,
            document?.sup && (document?.sup?.uuid !== this.relativeTo?.uuid),
          ))
      ) { yield document; }
    }
  }

  /**
   * Filter and then sort an array of documents.
   * @template T
   * @param {T[]} documents
   * @returns {T[]}
   */
  previewDocuments(documents) {
    return this.sortDocuments([...this.filterDocuments(documents)]);
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
