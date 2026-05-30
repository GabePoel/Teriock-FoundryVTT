import { preLocalize } from "../../helpers/localization.mjs";

export default {
  aura: { label: "TERIOCK.TERMS.Delivery.aura", sizes: "radius", template: "circle" },
  cone: { label: "TERIOCK.TERMS.Delivery.cone", sizes: "length", template: "cone" },
};

preLocalize("config.delivery", { keys: ["label"] });
