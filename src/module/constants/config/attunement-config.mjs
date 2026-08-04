import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { colors } from "../display/colors.mjs";
import { icons } from "../display/icons.mjs";
import systemConfig from "./system-config.mjs";

export default {
  kind: /** @enum {Teriock.Config.KindEntry} */ {
    effect: { color: colors.palette.orange, icon: icons.document.consequence, label: "TYPES.ActiveEffect.effect" },
    equipment: { color: colors.palette.brown, icon: icons.document.equipment, label: "TYPES.Item.equipment" },
    mount: { color: colors.palette.green, icon: icons.document.mount, label: "TYPES.Item.mount" },
    ...systemConfig.childKinds,
  },
};

preLocalizeConfig("config.attunement.kind", { keys: ["label"] });
