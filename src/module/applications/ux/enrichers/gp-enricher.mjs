import { createElement, formatGp } from "../../../utils/_module.mjs";

/** @type {Teriock.Enrichment.EnricherConfig} */
const gpEnricher = {
  format: { aliases: ["gp"], hasConfig: false, hasMultipleArguments: false, type: "display" },
  id: "gp-symbol",
  process: async (inputs) => {
    const s = inputs.arguments.length ? formatGp(inputs.arguments[0]) : _loc("TERIOCK.COMMON.GP");
    return createElement("span", { classes: ["teriock-gp-symbol"], innerText: s });
  },
};

export default gpEnricher;
