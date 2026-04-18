import { preLocalize } from "../../helpers/localization.mjs";

export const deliveryConfig = {
  aura: {
    label: "TERIOCK.TERMS.Delivery.aura",
    template: "circle",
    sizes: "radius",
  },
  cone: {
    label: "TERIOCK.TERMS.Delivery.cone",
    template: "cone",
    sizes: "length",
  },
};

preLocalize("config.delivery", { keys: ["label"] });
