import { preLocalize } from "../../helpers/localization.mjs";
import { colors } from "../display/colors.mjs";
import { icons } from "../display/icons.mjs";

export default {
  type: /** @enum {Teriock.Config.SubtypeEntry} */ {
    backstory: { color: colors.palette.green, icon: icons.power.backstory, label: "TERIOCK.TERMS.PowerType.backstory" },
    blessing: { color: colors.palette.yellow, icon: icons.power.blessing, label: "TERIOCK.TERMS.PowerType.blessing" },
    curse: { color: colors.palette.red, icon: icons.power.curse, label: "TERIOCK.TERMS.PowerType.curse" },
    deathScar: { color: colors.palette.red, icon: icons.power.deathScar, label: "TERIOCK.TERMS.PowerType.deathScar" },
    familiar: { color: colors.palette.green, icon: icons.power.familiar, label: "TERIOCK.TERMS.PowerType.familiar" },
    holiday: { color: colors.palette.yellow, icon: icons.power.holiday, label: "TERIOCK.TERMS.PowerType.holiday" },
    innate: { color: colors.palette.purple, icon: icons.power.innate, label: "TERIOCK.TERMS.PowerType.innate" },
    learned: { color: colors.palette.brown, icon: icons.power.learned, label: "TERIOCK.TERMS.PowerType.learned" },
    other: { color: colors.palette.green, icon: icons.power.other, label: "TERIOCK.TERMS.PowerType.other" },
    pact: { color: colors.palette.grey, icon: icons.power.pact, label: "TERIOCK.TERMS.PowerType.pact" },
    traits: { color: colors.palette.green, icon: icons.power.traits, label: "TERIOCK.TERMS.PowerType.traits" },
  },
};

preLocalize("config.power.type", { keys: ["label"] });
