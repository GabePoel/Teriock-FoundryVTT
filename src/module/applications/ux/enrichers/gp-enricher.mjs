import { createElement } from "../../../helpers/html.mjs";

/** @type {Teriock.Enrichment.EnricherConfig} */
const gpEnricher = {
  format: { aliases: ["gp"], hasConfig: false, hasMultipleArguments: false, type: "display" },
  id: "gp-symbol",
  process: async (inputs) => {
    return createElement("span", { classes: ["teriock-gp-symbol"], innerText: `₲${inputs.arguments[0] ?? ""}` });
  },
};

export default gpEnricher;
