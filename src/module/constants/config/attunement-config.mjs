import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { icons } from "../display/_module.mjs";
import colors from "../display/colors.mjs";
import systemConfig from "./system-config.mjs";

export default {
  kind: /** @enum {Teriock.Config.KindEntry} */ {
    effect: {
      color: colors.palette.orange,
      icon: icons.manifest.document.consequence,
      label: "TYPES.ActiveEffect.effect",
    },
    equipment: { color: colors.palette.brown, icon: icons.manifest.document.equipment, label: "TYPES.Item.equipment" },
    mount: { color: colors.palette.green, icon: icons.manifest.document.mount, label: "TYPES.Item.mount" },
    ...systemConfig.childKinds,
  },
};

preLocalizeConfig("config.attunement.kind", { keys: ["label"] });
