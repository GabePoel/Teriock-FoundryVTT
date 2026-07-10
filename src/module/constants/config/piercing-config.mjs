import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

export default {
  levels: {
    0: { icon: icons.piercing.none, identifier: "core:attack-interaction", label: "TERIOCK.MODELS.Piercing.MENU.0" },
    1: { icon: icons.piercing.av0, identifier: "keyword:armor-voiding", label: "TERIOCK.MODELS.Piercing.MENU.1" },
    2: { icon: icons.piercing.ub, identifier: "keyword:unblockable", label: "TERIOCK.MODELS.Piercing.MENU.2" },
  },
};

preLocalizeConfig("config.piercing.levels", { keys: ["label"] });
