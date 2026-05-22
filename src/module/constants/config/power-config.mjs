import { preLocalize } from "../../helpers/localization.mjs";
import { colors } from "../display/colors.mjs";
import { icons } from "../display/icons.mjs";

export const powerConfig = {
  type: /** @enum {Teriock.Config.SubtypeEntry} */ {
    backstory: { color: colors.green, icon: icons.power.backstory, label: "TERIOCK.TERMS.PowerType.backstory" },
    blessing: { color: colors.yellow, icon: icons.power.blessing, label: "TERIOCK.TERMS.PowerType.blessing" },
    curse: { color: colors.red, icon: icons.power.curse, label: "TERIOCK.TERMS.PowerType.curse" },
    deathScar: { color: colors.red, icon: icons.power.deathScar, label: "TERIOCK.TERMS.PowerType.deathScar" },
    familiar: { color: colors.green, icon: icons.power.familiar, label: "TERIOCK.TERMS.PowerType.familiar" },
    holiday: { color: colors.yellow, icon: icons.power.holiday, label: "TERIOCK.TERMS.PowerType.holiday" },
    innate: { color: colors.purple, icon: icons.power.innate, label: "TERIOCK.TERMS.PowerType.innate" },
    learned: { color: colors.brown, icon: icons.power.learned, label: "TERIOCK.TERMS.PowerType.learned" },
    other: { color: colors.green, icon: icons.power.other, label: "TERIOCK.TERMS.PowerType.other" },
    pact: { color: colors.grey, icon: icons.power.pact, label: "TERIOCK.TERMS.PowerType.pact" },
    traits: { color: colors.green, icon: icons.power.traits, label: "TERIOCK.TERMS.PowerType.traits" },
  },
};

preLocalize("config.power.type", { keys: ["label"] });
