import { default as index } from "../../../json/wiki-index.json" with { type: "json" };
import { icons } from "../display/_module.mjs";
import documentConfig from "./document-config.mjs";

export default {
  address: "https://wiki.teriock.com/index.php",
  index: /** @type {Record<string, Record<Identifier, string>>} */ (index),
  namespaces: /** @type {Record<string,Teriock.Config.WikiNamespaceEntry>} */ {
    Condition: { icon: documentConfig.condition.icon, identifierType: "rule" },
    Core: { icon: icons.manifest.document.core, identifierType: "core" },
    Keyword: { icon: icons.manifest.document.keyword, identifierType: "keyword" },
  },
};
