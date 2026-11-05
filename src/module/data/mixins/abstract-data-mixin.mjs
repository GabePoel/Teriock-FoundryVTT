/**
 * @import { DataModel, Document, TypeDataModel } from "@common/abstract/_module.mjs";
 * @import { ChoiceInputConfig } from "@common/data/_types.mjs";
 */

import { listFormat } from "../../helpers/localization.mjs";
import {
  fieldSorterFactory,
  fromKeySync,
  getName,
  checkFieldVisibility,
  toCamelCase,
  toKebabCase,
} from "../../utils/_module.mjs";
import { validateTypedIdentifier } from "../fields/tools/validators.mjs";

const { fields } = foundry.data;

/**
 * Get one value from a choice input config.
 * @param {Partial<ChoiceInputConfig>} config
 * @param {string|number} value
 */
function getChoiceLabel(config, value) {
  const option = config.options.find((o) => o.value === value);
  return _loc(option?.label ?? String(value ?? ""));
}

/**
 * Mixin for all documents and data models.
 * @template {MixinBase<Constructor<DataModel | Document | TypeDataModel>>} T
 * @param {T} Base
 */
export default function AbstractDataMixin(Base) {
  /** @mixin */
  class AbstractData extends Base {
    /**
     * A field sorter for this data model.
     * @type {Teriock.Sort.FieldSorter}
     */
    fieldSorter = fieldSorterFactory(this);

    /**
     * Path to this data model.
     * @returns {string}
     */
    get localPath() {
      return this.schema.fieldPath;
    }

    /**
     * @inheritDoc
     * @param {Teriock.Documents.DocumentName} [documentName]
     * @returns {TeriockDocument|null}
     */
    getNearestDocument(documentName) {
      let doc = super.getNearestDocument();
      while (documentName && doc && doc.documentName !== documentName) { doc = doc.parent; }
      return doc ?? null;
    }

    /**
     * Traverse the data model instance, getting a formatted string representation for a particular property.
     * @param {string|string[]} key
     * @param {object} [options]
     * @param {boolean} [options.link=false] - Evaluate documents as UUIDs
     * @param {boolean} [options.name=true] - Evaluate documents as their names
     * @param {boolean} [options.sort=true] - Sort iterable options
     * @param {boolean} [options.source=false] - Return source data
     * @param {string} [options.style] - Style formatting
     */
    getStringForProperty(key, options = {}) {
      const field = this.getFieldForProperty(key);

      // Path needs to be compatible with `getFieldForProperty()`
      let path = Array.isArray(key) ? key.join(".") : key;

      // Don't include stats
      if (path.includes("_stats")) { return ""; }

      // Value can be set to display source data
      if (options.source) {
        if (path.startsWith("system.")) { path = path.replace("system.", "system._source."); }
        else { path = `_source.${path}`; }
      }
      let value = foundry.utils.getProperty(this, path);
      let textContent = "";
      let fetched;

      // Assume certain formatting happens by default
      const name = Boolean(options.name ?? true);
      const sort = Boolean(options.sort ?? true);
      const link = Boolean(options.link ?? false);
      const type = ["disjunction", "unit"].includes(options.list) ? options.list : "conjunction";

      if (field) {
        // Exclude any fields this user shouldn't be able to see
        if (!checkFieldVisibility(field, this)) { return _loc("COMMON.Unknown"); }

        // Exclude any `HTMLField` so we don't have recursive lookups or unsafe strings
        if (field instanceof fields.HTMLField) { return ""; }

        // Data models with a label return that
        if (field instanceof fields.EmbeddedDataField && typeof value?.label === "string") {
          textContent = value.label;
        }

        // Booleans are displayed as the label or the inversion of the label
        if (field instanceof fields.BooleanField && field.label) {
          if (value) { textContent = _loc(field.label); }
          else { textContent = _loc("TERIOCK.FORMAT.invert", { value: _loc(field.label) }); }
        }

        // Strings and numbers get converted to their choices if possible
        if (!fetched && field?.choices) {
          // Handling for single-value fields like `NumberField` and `StringField`
          const config = { choices: field?.choices, value };
          fields.StringField._prepareChoiceConfig(config);
          textContent = getChoiceLabel(config, config.value);
          fetched = true;
        } else if (!fetched && ["Array", "Set"].includes(foundry.utils.getType(value)) && field?.element?.choices) {
          // Handling for multi-value fields like `SetField` and `ArrayField` as long as their element is single-valued
          const config = { choices: field.element.choices, value };
          fields.StringField._prepareChoiceConfig(config);
          const values = config.value.map((v) => getChoiceLabel(config, v));
          textContent = listFormat(values, { sort, type });
          fetched = true;
        }
      }

      // Identifiers and UUIDs get displayed with their actual name if possible
      if (!fetched && !textContent && typeof value === "string") {
        try {
          if (validateTypedIdentifier(value, { strict: true }) && name) { textContent = getName(value); }
          else {
            const doc = fromKeySync(value);
            if (doc) { value = doc; }
          }
        } catch {
          // Don't do anything if fetching the document failed.
          // TODO: Handle this process better.
        }
      }
      if (!fetched && !textContent && typeof value === "object") {
        if (name && value?.name) { textContent = value.name; }
        if (link && value?.link) { textContent = value.uuid; }
      }
      if (!fetched && !textContent && ["boolean", "number", "string"].includes(typeof value)) {
        textContent = value.toString();
      }
      if (typeof textContent !== "string") { textContent = ""; }

      // Apply any requested styling
      const style = options.style;
      if (style && !link) {
        switch (style) {
          case "upper":
          case "uc":
            textContent = textContent.toUpperCase();
            break;
          case "lower":
          case "lc":
            textContent = textContent.toLocaleLowerCase(game.i18n.lang);
            break;
          case "title":
          case "tc":
            textContent = textContent.titleCase();
            break;
          case "camel":
          case "cc":
            textContent = toCamelCase(textContent);
            break;
          case "kebab":
          case "kc":
            textContent = toKebabCase(textContent);
            break;
          case "upperFirst":
          case "ucf":
            textContent = textContent.capitalize();
            break;
          default:
            break;
        }
      }
      return textContent;
    }
  }

  return AbstractData;
}
