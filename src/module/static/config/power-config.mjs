import { preLocalizeObject } from "../../helpers/localization.mjs";
import { colors, icons } from "../display/_module.mjs";
import systemConfig from "./system-config.mjs";

export default {
  kind: /** @enum {Teriock.Config.KindEntry} */ {
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
    traits: { color: colors.palette.green, icon: icons.manifest.power.traits, label: "TERIOCK.TERMS.PowerKind.traits" },
    ...systemConfig.childKinds,
    other: { ...systemConfig.childKinds.other, label: "TERIOCK.TERMS.PowerKind.other" },
  },
};

preLocalizeObject("CONFIG.power.kind", { keys: ["label"] });
