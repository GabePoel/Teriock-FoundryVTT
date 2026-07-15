import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

export default {
  components: {
    keys: {
      material: "TERIOCK.COSTS.Components.material",
      somatic: "TERIOCK.COSTS.Components.somatic",
      verbal: "TERIOCK.COSTS.Components.verbal",

      break: "TERIOCK.COSTS.Components.break",
      hack: "TERIOCK.COSTS.Components.hack",

      other: "TERIOCK.COSTS.Components.other",
    },
    types: { description: "TERIOCK.COSTS.Types.description", tag: "TERIOCK.COSTS.Types.tag" },
  },
  primary: { types: { description: "TERIOCK.COSTS.Types.description", formula: "TERIOCK.COSTS.Types.formula" } },
  tweaks: {
    adept: { icon: icons.form.special, label: "TERIOCK.COSTS.Tweaks.adept", multiplier: -1, primary: "mp" },
    gifted: { icon: icons.form.gifted, label: "TERIOCK.COSTS.Tweaks.gifted", multiplier: 1, primary: "mp" },
    inept: { icon: icons.form.flaw, label: "TERIOCK.COSTS.Tweaks.inept", multiplier: 1, primary: "mp" },
  },
};

preLocalizeConfig("config.cost.primary.types");
preLocalizeConfig("config.cost.components.keys");
preLocalizeConfig("config.cost.components.types");
preLocalizeConfig("config.cost.tweaks", { key: "label" });
