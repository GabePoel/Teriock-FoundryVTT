import wikiConfig from "../../../constants/config/wiki-config.mjs";
import { createElement } from "../../../helpers/html.mjs";

/** @type {Teriock.Enrichment.EnricherConfig} */
const wikiEnricher = {
  format: { aliases: ["Wiki", "L"], hasConfig: false, hasMultipleArguments: false, type: "link" },
  process: async (inputs) => {
    const pageName = inputs.arguments[0];
    const page = pageName.split(":")[1];
    const label = inputs.label ?? page;
    const relativeAddress = pageName.replace(/ /g, "_");
    const address = `${wikiConfig.address}/${relativeAddress}`;
    return createElement("a", {
      dataset: { tooltip: pageName.replace(":", ": ") },
      href: address,
      innerText: label,
      rel: "noopener noreferrer",
      target: "_blank",
    });
  },
};

export default wikiEnricher;
