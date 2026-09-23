import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { wikiIndexToConfig } from "../../helpers/utils.mjs";

export default { traits: wikiIndexToConfig("trait", "TERIOCK.TERMS.Traits") };

preLocalizeConfig("config.species.traits", { key: "label" });
