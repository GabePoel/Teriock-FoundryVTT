import { TeriockTextEditor } from "../_module.mjs";
import { createElement } from "../../../helpers/html.mjs";
import { fromKey } from "../../../helpers/utils.mjs";

/** @type {Teriock.Enrichment.EnricherConfig} */
const lookupEnricher = {
  format: { aliases: ["lookup"], hasConfig: true, hasMultipleArguments: true, type: "display" },
  process: async (inputs, options) => {
    let key = inputs.arguments[0];
    // We don't have any special handling for roll data. But since lots of other systems do, we accomodate "@" prefixes.
    if (key.startsWith("@")) { key = key.slice(1); }
    let textContent = "";
    const doc = options?.relativeTo;
    if (key && doc) { textContent = doc.getStringForProperty(key, inputs.config); }
    if (inputs.config.link) {
      await game.teriock.identifiers.initializing;
      const doc = await fromKey(textContent);
      if (doc) { return TeriockTextEditor._createContentLink([null, "UUID", doc?.uuid, ""]); }
    }
    return createElement("span", { textContent });
  },
};

export default lookupEnricher;
