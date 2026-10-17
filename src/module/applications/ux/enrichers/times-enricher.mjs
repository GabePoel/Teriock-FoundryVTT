import { createElement } from "../../../utils/_module.mjs";

/** @type {Teriock.Enrichment.EnricherConfig} */
const timesEnricher = {
  format: { aliases: ["times"], hasConfig: false, hasMultipleArguments: false, type: "display" },
  id: "times-symbol",
  process: async () => {
    return createElement("span", { classes: ["teriock-times-symbol"], innerText: "×" });
  },
};

export default timesEnricher;
