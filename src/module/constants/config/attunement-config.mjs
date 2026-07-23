import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

export default {
  origin: /** @enum {Teriock.Config.SubtypeEntry} */ {
    effect: { icon: icons.document.consequence, label: "TYPES.ActiveEffect.effect" },
    equipment: { icon: icons.document.equipment, label: "TYPES.Item.equipment" },
    mount: { icon: icons.document.mount, label: "TYPES.Item.mount" },
  },
};

preLocalizeConfig("config.attunement.origin", { keys: ["label"] });
