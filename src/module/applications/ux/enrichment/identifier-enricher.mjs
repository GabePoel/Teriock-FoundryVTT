import { TeriockTextEditor } from "../_module.mjs";
import { wikiConfig } from "../../../constants/config/wiki-config.mjs";
import { makeIconClass, parseIdentifier } from "../../../helpers/utils.mjs";

const IDENTIFIER_ICON_MAP = Object.fromEntries(
  Object.values(wikiConfig.namespaces).filter(c => c.identifierType && c.icon).map(c => [c.identifierType, c.icon]),
);

/** @type {Teriock.Enrichment.EnricherConfig} */
const identifierEnricher = {
  format: { aliases: ["Identifier", "I"], hasConfig: false, hasMultipleArguments: false, type: "link" },
  process: async (inputs) => {
    await game.teriock.identifiers.initializing;
    const identifier = inputs.arguments[0];
    const contentLinkMatch = [null, "UUID", game.teriock.identifiers.get(identifier), "", inputs.label];
    const out = await TeriockTextEditor._createContentLink(contentLinkMatch);
    const parsed = parseIdentifier(identifier);
    if (parsed && IDENTIFIER_ICON_MAP[parsed.type]) {
      const iconClass = makeIconClass(IDENTIFIER_ICON_MAP[parsed.type], "solid");
      out.querySelectorAll("i").forEach(icon => {
        icon.className = iconClass;
      });
    }
    return out;
  },
};

export default identifierEnricher;
