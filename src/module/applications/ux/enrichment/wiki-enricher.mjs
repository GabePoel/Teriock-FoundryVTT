import { TeriockTextEditor } from "../_module.mjs";
import wikiConfig from "../../../constants/config/wiki-config.mjs";

/** @type {Teriock.Enrichment.EnricherConfig} */
const wikiEnricher = {
  format: { aliases: ["Wiki", "L"], hasConfig: false, hasMultipleArguments: false, type: "link" },
  process: async (inputs) => {
    const pageName = inputs.arguments[0];
    return TeriockTextEditor.createAnchor({
      attrs: {
        href: `${wikiConfig.address}/${pageName.replace(/ /g, "_")}`,
        rel: "noopener noreferrer",
        target: "_blank",
      },
      dataset: { tooltip: pageName.replace(":", ": ") },
      name: inputs.label ?? pageName.split(":")[1],
    });
  },
};

export default wikiEnricher;
