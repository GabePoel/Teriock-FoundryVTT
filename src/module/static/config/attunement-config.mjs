import { preLocalizeObject } from "../../helpers/localization.mjs";
import { icons } from "../display/_module.mjs";
import colors from "../display/colors.mjs";
import systemConfig from "./system-config.mjs";

export default {
  kind: /** @enum {Teriock.Config.KindEntry} */ {
    blessing: { color: colors.palette.yellow, icon: icons.manifest.document.blessing, label: "TYPES.Item.blessing" },
    effect: {
      color: colors.palette.orange,
      icon: icons.manifest.document.consequence,
      label: "TYPES.ActiveEffect.effect",
    },
    equipment: { color: colors.palette.brown, icon: icons.manifest.document.equipment, label: "TYPES.Item.equipment" },
    familiar: { color: colors.palette.green, icon: icons.manifest.document.familiar, label: "TYPES.Item.familiar" },
    mount: { color: colors.palette.blue, icon: icons.manifest.document.mount, label: "TYPES.Item.mount" },
    pact: { color: colors.palette.purple, icon: icons.manifest.document.pact, label: "TYPES.Item.pact" },
    ...systemConfig.childKinds,
  },
};

preLocalizeObject("CONFIG.attunement.kind", { keys: ["label"] });
