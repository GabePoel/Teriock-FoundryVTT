import { default as index } from "../../../json/wiki-index.json" with { type: "json" };
import { icons } from "../display/_module.mjs";
import documentConfig from "./document-config.mjs";

export default {
  address: "https://wiki.teriock.com/index.php",
  index,
  namespaces: {
    Condition: /** @type {Teriock.Config.WikiNamespaceEntry} */ {
      icon: documentConfig.condition.icon,
      identifierType: "rule",
    },
    Core: /** @type {Teriock.Config.WikiNamespaceEntry} */ {
      icon: icons.manifest.document.core,
      identifierType: "core",
    },
    Keyword: /** @type {Teriock.Config.WikiNamespaceEntry} */ {
      icon: icons.manifest.document.keyword,
      identifierType: "keyword",
    },
  },
};
