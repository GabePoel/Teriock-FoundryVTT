import { createElement } from "../../../helpers/html.mjs";
import { toCamelCase, toKebabCase, toTitleCase, ucFirst } from "../../../helpers/string.mjs";

/** @type {Teriock.Enrichment.EnricherConfig} */
const lookupEnricher = {
  format: { aliases: ["lookup"], hasConfig: true, hasMultipleArguments: true, type: "display" },
  process: async (inputs, options) => {
    let lookupKey = inputs.arguments[0];
    if (lookupKey.startsWith("@")) lookupKey = lookupKey.slice(1);
    const raw = foundry.utils.getProperty(options?.relativeTo, lookupKey);
    let textContent = "";
    if (["boolean", "number", "string"].includes(typeof raw)) textContent = raw.toString();
    const style = inputs.config["style"];
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
          textContent = ucFirst(textContent);
          break;
      }
    }
    return createElement("span", { textContent });
  },
};

export default lookupEnricher;
