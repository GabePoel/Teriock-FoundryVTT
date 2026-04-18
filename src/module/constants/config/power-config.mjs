import { preLocalize } from "../../helpers/localization.mjs";
import { colors } from "../display/colors.mjs";
import { icons } from "../display/icons.mjs";

export const powerConfig = {
  type: /** @enum {Teriock.Config.SubtypeEntry} */ {
    backstory: {
      label: "TERIOCK.TERMS.PowerType.backstory",
      icon: icons.power.backstory,
      color: colors.green,
    },
    blessing: {
      label: "TERIOCK.TERMS.PowerType.blessing",
      icon: icons.power.blessing,
      color: colors.yellow,
    },
    curse: {
      label: "TERIOCK.TERMS.PowerType.curse",
      icon: icons.power.curse,
      color: colors.red,
    },
    deathScar: {
      label: "TERIOCK.TERMS.PowerType.deathScar",
      icon: icons.power.deathScar,
      color: colors.red,
    },
    familiar: {
      label: "TERIOCK.TERMS.PowerType.familiar",
      icon: icons.power.familiar,
      color: colors.green,
    },
    holiday: {
      label: "TERIOCK.TERMS.PowerType.holiday",
      icon: icons.power.holiday,
      color: colors.yellow,
    },
    innate: {
      label: "TERIOCK.TERMS.PowerType.innate",
      icon: icons.power.innate,
      color: colors.purple,
    },
    learned: {
      label: "TERIOCK.TERMS.PowerType.learned",
      icon: icons.power.learned,
      color: colors.brown,
    },
    other: {
      label: "TERIOCK.TERMS.PowerType.other",
      icon: icons.power.other,
      color: colors.green,
    },
    pact: {
      label: "TERIOCK.TERMS.PowerType.pact",
      icon: icons.power.pact,
      color: colors.grey,
    },
    traits: {
      label: "TERIOCK.TERMS.PowerType.traits",
      icon: icons.power.traits,
      color: colors.green,
    },
  },
};

preLocalize("config.power.type", { keys: ["label"] });
