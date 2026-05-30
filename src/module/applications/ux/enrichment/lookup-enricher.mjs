import { typedIdentifierValidator } from "../../../data/fields/helpers/validators.mjs";
import { createElement } from "../../../helpers/html.mjs";
import { listFormat } from "../../../helpers/localization.mjs";
import { toCamelCase, toKebabCase, toTitleCase, ucFirst } from "../../../helpers/string.mjs";
import { getName } from "../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * Get one value from a choice input config.
 * @param {Partial<ChoiceInputConfig>} config
 * @param {string|number} value
 */
function getOptionLabel(config, value) {
  const option = config.options.find((o) => o.value === value);
  return _loc(option?.label ?? value.toString());
}

/** @type {Teriock.Enrichment.EnricherConfig} */
const lookupEnricher = {
  format: { aliases: ["lookup"], hasConfig: true, hasMultipleArguments: true, type: "display" },
  process: async (inputs, options) => {
    let lookupKey = inputs.arguments[0];
    // We don't have any special handling for roll data. But since lots of other systems do, we accomodate "@" prefixes.
    if (lookupKey.startsWith("@")) { lookupKey = lookupKey.slice(1); }
    let textContent = "";

    const doc = options?.relativeTo;

    // Assume certain formatting happens by default
    const name = Boolean(inputs.config.name ?? true);
    const sort = Boolean(inputs.config.sort ?? true);
    const type = ["disjunction", "unit"].includes(inputs.config.list) ? inputs.config.list : "conjunction";

    if (doc) {
      const raw = foundry.utils.getProperty(options?.relativeTo, lookupKey);
      const field = doc.getFieldForProperty(lookupKey);
      // If there's a data field that defines the property, we try to format our output from the field's choices.
      if (field) {
        if (field instanceof fields.BooleanField && field.label) {
          // Just display the label or its inversion for a `BooleanField`
          if (raw) { textContent = _loc(field.label); }
          else { textContent = _loc("TERIOCK.FORMAT.invert", { value: _loc(field.label) }); }
        }
        if (field?.choices) {
          // Handling for single-value fields like `NumberField` and `StringField`
          const config = { choices: field?.choices, value: raw };
          fields.StringField._prepareChoiceConfig(config);
          textContent = getOptionLabel(config, config.value);
        } else if (["Array", "Set"].includes(foundry.utils.getType(raw)) && field?.element?.choices) {
          // Handling for multi-value fields like `SetField` and `ArrayField` as long as their element is single-valued
          const config = { choices: field.element.choices, value: raw };
          fields.StringField._prepareChoiceConfig(config);
          const values = config.value.map((v) => getOptionLabel(config, v));
          textContent = listFormat(values, { sort, type });
        }
      }
      if (!textContent && ["boolean", "number", "string"].includes(typeof raw)) { textContent = raw.toString(); }
      if (name && typedIdentifierValidator(raw, { strict: true })) { textContent = getName(raw); }
      const style = inputs.config.style;
      if (style) {
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
            textContent = toTitleCase(textContent);
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
            textContent = ucFirst(textContent.toLowerCase());
            break;
          default:
            break;
        }
      }
    }
    return createElement("span", { textContent });
  },
};

export default lookupEnricher;
