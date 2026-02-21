import { preLocalize } from "../../helpers/localization.mjs";
import { colors } from "../display/colors.mjs";
import { icons } from "../display/icons.mjs";

export const powerOptions = {
  backstory: {
    name: "TERIOCK.TERMS.PowerType.backstory",
    icon: icons.power.backstory,
    color: colors.green,
  },
  blessing: {
    name: "TERIOCK.TERMS.PowerType.blessing",
    icon: icons.power.blessing,
    color: colors.yellow,
  },
  curse: {
    name: "TERIOCK.TERMS.PowerType.curse",
    icon: icons.power.curse,
    color: colors.red,
  },
  deathScar: {
    name: "TERIOCK.TERMS.PowerType.deathScar",
    icon: icons.power.deathScar,
    color: colors.red,
  },
  familiar: {
    name: "TERIOCK.TERMS.PowerType.familiar",
    icon: icons.power.familiar,
    color: colors.green,
  },
  holiday: {
    name: "TERIOCK.TERMS.PowerType.holiday",
    icon: icons.power.holiday,
    color: colors.yellow,
  },
  innate: {
    name: "TERIOCK.TERMS.PowerType.innate",
    icon: icons.power.innate,
    color: colors.purple,
  },
  learned: {
    name: "TERIOCK.TERMS.PowerType.learned",
    icon: icons.power.learned,
    color: colors.brown,
  },
  other: {
    name: "TERIOCK.TERMS.PowerType.other",
    icon: icons.power.other,
    color: colors.green,
  },
  pact: {
    name: "TERIOCK.TERMS.PowerType.pact",
    icon: icons.power.pact,
    color: colors.grey,
  },
  traits: {
    name: "TERIOCK.TERMS.PowerType.traits",
    icon: icons.power.traits,
    color: colors.green,
  },
};

preLocalize("options.power", { keys: ["name"] });
