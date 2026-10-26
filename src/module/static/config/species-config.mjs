import { preLocalizeObject } from "../../helpers/localization.mjs";
import { wikiIndexToConfig } from "../../utils/_module.mjs";

export default { traits: wikiIndexToConfig("trait", "TERIOCK.TERMS.Traits") };

preLocalizeObject("CONFIG.species.traits", { key: "label" });
