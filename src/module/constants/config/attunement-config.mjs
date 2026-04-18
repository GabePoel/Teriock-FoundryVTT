import { preLocalize } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

export const attunementConfig = {
  type: {
    effect: {
      icon: icons.document.consequence,
      label: "TYPES.ActiveEffect.effect",
    },
    equipment: {
      icon: icons.document.equipment,
      label: "TYPES.Item.equipment",
    },
    mount: { icon: icons.document.mount, label: "TYPES.Item.mount" },
  },
};

preLocalize("config.attunement.type", { keys: ["label"] });
