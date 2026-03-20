import { preLocalize } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

export const attunementOptions = {
  type: {
    effect: {
      icon: icons.document.consequence,
      name: "TYPES.ActiveEffect.effect",
    },
    equipment: { icon: icons.document.equipment, name: "TYPES.Item.equipment" },
    mount: { icon: icons.document.mount, name: "TYPES.Item.mount" },
  },
};

preLocalize("options.attunement.type", { keys: ["name"] });
