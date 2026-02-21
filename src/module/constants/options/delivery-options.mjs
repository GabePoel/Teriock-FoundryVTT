import { preLocalize } from "../../helpers/localization.mjs";

export const deliveryOptions = {
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

preLocalize("options.delivery", { keys: ["label"] });
