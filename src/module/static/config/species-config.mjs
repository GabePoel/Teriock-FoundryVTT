import { preLocalizeObject } from "../../helpers/localization.mjs";
import { wikiIndexToConfig } from "../../utils/_module.mjs";

export default {
  families: wikiIndexToConfig("family", "TERIOCK.TERMS.Families"),
  traits: wikiIndexToConfig("trait", "TERIOCK.TERMS.Traits"),
  undeadLevels: {
    0: "COMMON.None",
    1: "TERIOCK.SYSTEMS.Species.UNDEAD_LEVELS.partial",
    2: "TERIOCK.SYSTEMS.Species.UNDEAD_LEVELS.minor",
    3: "TERIOCK.SYSTEMS.Species.UNDEAD_LEVELS.full",
    4: "TERIOCK.SYSTEMS.Species.UNDEAD_LEVELS.greater",
  },
};

preLocalizeObject("CONFIG.species.families", { key: "label" });
preLocalizeObject("CONFIG.species.traits", { key: "label" });
preLocalizeObject("CONFIG.species.undeadLevels");
