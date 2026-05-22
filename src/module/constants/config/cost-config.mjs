import { preLocalize } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

export const costConfig = {
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
  primary: {
    keys: {
      gp: {
        abbreviation: "TERIOCK.STATS.gp.abbreviation",
        barStat: false,
        icon: icons.stat.gp,
        impact: "pay",
        label: "TERIOCK.COSTS.Primary.gp",
        multiplier: -1,
      },
      hp: {
        abbreviation: "TERIOCK.STATS.hp.abbreviation",
        barStat: true,
        icon: icons.stat.hp,
        impact: "damage",
        label: "TERIOCK.COSTS.Primary.hp",
        multiplier: -1,
      },
      lp: {
        abbreviation: "TERIOCK.STATS.lp.abbreviation",
        barStat: true,
        icon: icons.stat.lp,
        impact: "wither",
        label: "TERIOCK.COSTS.Primary.lp",
        multiplier: +1,
      },
      mp: {
        abbreviation: "TERIOCK.STATS.mp.abbreviation",
        barStat: true,
        icon: icons.stat.mp,
        impact: "drain",
        label: "TERIOCK.COSTS.Primary.mp",
        multiplier: -1,
      },
    },
    types: { description: "TERIOCK.COSTS.Types.description", formula: "TERIOCK.COSTS.Types.formula" },
  },
  tweaks: {
    adept: { icon: icons.form.special, label: "TERIOCK.COSTS.Tweaks.adept", multiplier: -1, primary: "mp" },
    gifted: { icon: icons.form.gifted, label: "TERIOCK.COSTS.Tweaks.gifted", multiplier: 1, primary: "mp" },
    inept: { icon: icons.form.flaw, label: "TERIOCK.COSTS.Tweaks.inept", multiplier: 1, primary: "mp" },
  },
};

preLocalize("config.cost.primary.keys", { keys: ["abbreviation", "label"] });
preLocalize("config.cost.primary.types");
preLocalize("config.cost.components.keys");
preLocalize("config.cost.components.types");
preLocalize("config.cost.tweaks", { key: "label" });
