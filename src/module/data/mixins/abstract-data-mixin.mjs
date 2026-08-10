/**
 * @import { DataModel, Document, TypeDataModel } from "@common/abstract/_module.mjs";
 * @import { ChoiceInputConfig } from "@common/data/_types.mjs";
 */

import { listFormat } from "../../helpers/localization.mjs";
import { fieldSorterFactory } from "../../helpers/sort.mjs";
import { toCamelCase, toKebabCase } from "../../helpers/string.mjs";
import { fromKeySync, getName } from "../../helpers/utils.mjs";
import { validateTypedIdentifier } from "../fields/tools/validators.mjs";

const { fields } = foundry.data;

/**
 * Get one value from a choice input config.
 * @param {Partial<ChoiceInputConfig>} config
 * @param {string|number} value
 */
function getChoiceLabel(config, value) {
  const option = config.options.find((o) => o.value === value);
  return _loc(option?.label ?? value.toString());
}

/**
 * Mixin for both documents and data models.
 * @template {Constructor<DataModel | Document | TypeDataModel>} T
 * @param {T} Base
 */
export default function AbstractDataMixin(Base) {
  /**
   * @extends {DataModel | Document | TypeDataModel}
   * @mixin
   */
  class AbstractData extends Base {
    /**
     * A field sorter for this data model.
     * @type {Teriock.Sort.FieldSorter}
     */
    fieldSorter = fieldSorterFactory(this);

    /**
     * Traverse the data model instance, getting a formatted string representation for a particular property.
     * @param {string|string[]} key
     * @param {object} [options]
     * @param {boolean} [options.name];
     * @param {boolean} [options.sort];
     * @param {boolean} [options.link];
     * @param {string} [options.style];
     */
    getStringForProperty(key, options = {}) {
      const field = this.getFieldForProperty(key);
      let value = foundry.utils.getProperty(this, Array.isArray(key) ? key.join(".") : key);
      let textContent = "";
      let fetched;

      // Assume certain formatting happens by default
      const name = Boolean(options.name ?? true);
      const sort = Boolean(options.sort ?? true);
      const link = Boolean(options.link ?? false);
      const type = ["disjunction", "unit"].includes(options.list) ? options.list : "conjunction";

      if (field) {
        if (field instanceof fields.HTMLField) {
          // Exclude any `HTMLField` so we don't have recursive lookups or unsafe strings
          fetched = true;
        }
        if (field instanceof fields.BooleanField && field.label) {
          // Just display the label or its inversion for a `BooleanField`
          if (value) { textContent = _loc(field.label); }
          else { textContent = _loc("TERIOCK.FORMAT.invert", { value: _loc(field.label) }); }
        }
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
      if (!fetched && !textContent && typeof value === "string") {
        const doc = fromKeySync(value);
        if (doc) { value = doc; }
        else if (validateTypedIdentifier(value, { strict: true }) && name) { textContent = getName(value); }
      }
      if (!fetched && !textContent && typeof value === "object") {
        if (name && value.name) { textContent = value.name; }
        if (link && value.link) { textContent = value.uuid; }
      }
      if (!fetched && !textContent && ["boolean", "number", "string"].includes(typeof value)) {
        textContent = value.toString();
      }
      if (typeof textContent !== "string") { textContent = ""; }

      const style = options.style;
      if (style && !link) {
        switch (style) {
          case "upper":
          case "uc":
            textContent = textContent.toUpperCase();
            break;
          case "lower":
          case "lc":
            textContent = textContent.toLowerCase();
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
