import { TeriockTextEditor } from "../_module.mjs";

/** @type {Teriock.Enrichment.EnricherConfig} */
const identifierEnricher = {
  format: { aliases: ["Identifier", "I"], hasConfig: false, hasMultipleArguments: false, type: "link" },
  process: async (inputs) => {
    await game.teriock.identifiers.initializing;
    const identifier = inputs.arguments[0];
    const contentLinkMatch = [null, "UUID", game.teriock.identifiers.get(identifier), "", inputs.label];
    return TeriockTextEditor._createContentLink(contentLinkMatch);
  },
};

export default identifierEnricher;
