import { icons } from "../display/_module.mjs";
import documentConfig from "./document-config.mjs";

export default {
  address: "https://wiki.teriock.com/index.php",
  namespaces: /** @type {Record<string,Teriock.Config.WikiNamespaceEntry>} */ {
    Condition: { icon: documentConfig.condition.icon, identifierType: "rule", index: "conditions" },
    Core: { icon: icons.manifest.document.core, identifierType: "core", index: "coreRules" },
    Keyword: { icon: icons.manifest.document.keyword, identifierType: "keyword", index: "keywords" },
  },
};
