import { preLocalizeObject } from "../../helpers/localization.mjs";
import { wikiIndexToConfig } from "../../utils/_module.mjs";

export default {
  families: wikiIndexToConfig("family", "TERIOCK.TERMS.Families"),
  traits: wikiIndexToConfig("trait", "TERIOCK.TERMS.Traits"),
};

preLocalizeObject("CONFIG.species.families", { key: "label" });
preLocalizeObject("CONFIG.species.traits", { key: "label" });
