import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { icons } from "../display/_module.mjs";

export default {
  levels: {
    0: {
      icon: icons.manifest.piercing.none,
      identifier: "core:attack-interaction",
      label: "TERIOCK.MODELS.Piercing.MENU.0",
    },
    1: {
      icon: icons.manifest.piercing.av0,
      identifier: "keyword:armor-voiding",
      label: "TERIOCK.MODELS.Piercing.MENU.1",
    },
    2: { icon: icons.manifest.piercing.ub, identifier: "keyword:unblockable", label: "TERIOCK.MODELS.Piercing.MENU.2" },
  },
};

preLocalizeConfig("config.piercing.levels", { keys: ["label"] });
