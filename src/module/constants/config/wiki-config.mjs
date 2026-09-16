import { icons } from "../display/_module.mjs";
import documentConfig from "./document-config.mjs";

export default {
  address: "https://wiki.teriock.com/index.php",
  namespaces: /** @type {Record<string,Teriock.Config.WikiNamespaceEntry>} */ {
    Class: { icon: documentConfig.rank.icon, identifierType: "class" },
    Condition: { icon: documentConfig.condition.icon, identifierType: "rule", index: "conditions" },
    Core: { icon: icons.manifest.document.core, identifierType: "core", index: "coreRules" },
    Damage: { icon: documentConfig.damage.icon, identifierType: "damage" },
    Drain: { icon: documentConfig.drain.icon, identifierType: "drain" },
    Keyword: { icon: icons.manifest.document.keyword, identifierType: "keyword", index: "keywords" },
    Style: { icon: documentConfig.style.icon, identifierType: "style" },
    Tradecraft: { icon: documentConfig.fluency.icon, identifierType: "tradecraft" },
  },
};
