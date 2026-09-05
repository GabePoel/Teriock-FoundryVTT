import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { colors, icons } from "../display/_module.mjs";
import systemConfig from "./system-config.mjs";

export default {
  kind: /** @enum {Teriock.Config.KindEntry} */ {
    backstory: {
      color: colors.palette.green,
      icon: icons.manifest.power.backstory,
      label: "TERIOCK.TERMS.PowerKind.backstory",
    },
    blessing: {
      color: colors.palette.yellow,
      icon: icons.manifest.power.blessing,
      label: "TERIOCK.TERMS.PowerKind.blessing",
    },
    curse: { color: colors.palette.red, icon: icons.manifest.power.curse, label: "TERIOCK.TERMS.PowerKind.curse" },
    deathScar: {
      color: colors.palette.red,
      icon: icons.manifest.power.deathScar,
      label: "TERIOCK.TERMS.PowerKind.deathScar",
    },
    familiar: {
      color: colors.palette.green,
      icon: icons.manifest.power.familiar,
      label: "TERIOCK.TERMS.PowerKind.familiar",
    },
    holiday: {
      color: colors.palette.yellow,
      icon: icons.manifest.power.holiday,
      label: "TERIOCK.TERMS.PowerKind.holiday",
    },
    innate: {
      color: colors.palette.purple,
      icon: icons.manifest.power.innate,
      label: "TERIOCK.TERMS.PowerKind.innate",
    },
    learned: {
      color: colors.palette.brown,
      icon: icons.manifest.power.learned,
      label: "TERIOCK.TERMS.PowerKind.learned",
    },
    pact: { color: colors.palette.grey, icon: icons.manifest.power.pact, label: "TERIOCK.TERMS.PowerKind.pact" },
    traits: { color: colors.palette.green, icon: icons.manifest.power.traits, label: "TERIOCK.TERMS.PowerKind.traits" },
    ...systemConfig.childKinds,
    other: { ...systemConfig.childKinds.other, label: "TERIOCK.TERMS.PowerKind.other" },
  },
};

preLocalizeConfig("config.power.kind", { keys: ["label"] });
