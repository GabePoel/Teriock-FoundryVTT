import { createElement } from "../../../helpers/html.mjs";

/** @type {Teriock.Enrichment.EnricherConfig} */
const gpEnricher = {
  format: { aliases: ["gp"], hasConfig: false, hasMultipleArguments: false, type: "display" },
  id: "gp-symbol",
  process: async (inputs) => {
    let s = _loc("TERIOCK.COMMON.GP");
    if (inputs.arguments.length) {
      const amount = inputs.arguments[0];
      if (amount.startsWith("-")) {
        s = `-${_loc("TERIOCK.SYSTEMS.Equipment.PANELS.price", { value: amount.slice(1) })}`;
      } else {
        s = _loc("TERIOCK.SYSTEMS.Equipment.PANELS.price", { value: amount });
      }
    }
    return createElement("span", { classes: ["teriock-gp-symbol"], innerText: s });
  },
};

export default gpEnricher;
