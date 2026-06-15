import { TernaryField } from "../../fields/_module.mjs";
import EmbeddedDataModel from "../embedded-data-model.mjs";

const { fields } = foundry.data;

/**
 * @typedef {object} BaseFilters
 * @property {boolean|null} active
 * @property {boolean|null} children
 */

/**
 * @property {BaseFilters} filters
 * @property {string} search
 */
export default class BaseFilterModel extends EmbeddedDataModel {
  /**
   * The filter fields.
   * @returns {Record<string, DataField>}
   */
  static defineFilters() {
    return { active: new TernaryField(), children: new TernaryField() };
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      filters: new fields.SchemaField(this.defineFilters()),
      search: new fields.StringField(),
    });
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
   * @param {AnyCommonDocument|object} document
   * @param {string} path
   * @param {(*) => *} [transformation]
   * @returns {boolean}
   */
  _checkTernaryFilter(filter, document, path, transformation = (v) => v) {
    if (filter === null) { return true; }
    return (Boolean(filter) === Boolean(transformation(foundry.utils.getProperty(document, path))));
  }

  /**
   * Check a value filter.
   * @param {string|number|null} filter
   * @param {AnyCommonDocument|object} document
   * @param {string} path
   * @param {(*) => *} [transformation]
   * @returns {boolean}
   */
  _checkValueFilter(filter, document, path, transformation = (v) => v) {
    if (filter === null || filter === "") { return true; }
    const value = transformation(foundry.utils.getProperty(document, path));
    if (Array.isArray(value)) {
      return value.includes(filter);
    } else if (foundry.utils.getType(value) === "Set") {
      return value.has(filter);
    }
    return value === filter;
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
        this._checkTernaryFilter(this.filters.active, document, "active")
        && (!this.relativeTo || this._checkTernaryFilter(this.filters.children, document, "system._sup", (v) =>
          v === this.relativeTo?.uuid))
      ) { yield document; }
    }
  }
}
