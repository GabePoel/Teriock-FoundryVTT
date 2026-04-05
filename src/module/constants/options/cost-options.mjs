import { preLocalize } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

export const costOptions = {
  components: {
    keys: {
      material: "TERIOCK.COSTS.Components.material",
      somatic: "TERIOCK.COSTS.Components.somatic",
      verbal: "TERIOCK.COSTS.Components.verbal",
      break: "TERIOCK.COSTS.Components.break",
      hack: "TERIOCK.COSTS.Components.hack",
      other: "TERIOCK.COSTS.Components.other",
    },
    types: {
      tag: "TERIOCK.COSTS.Types.tag",
      description: "TERIOCK.COSTS.Types.description",
    },
  },
  primary: {
    keys: {
      gp: {
        abbreviation: "TERIOCK.STATS.gp.abbreviation",
        harm: "pay",
        icon: icons.stat.gp,
        label: "TERIOCK.COSTS.Primary.gp",
        multiplier: -1,
      },
      hp: {
        abbreviation: "TERIOCK.STATS.hp.abbreviation",
        harm: "damage",
        icon: icons.stat.hp,
        label: "TERIOCK.COSTS.Primary.hp",
        multiplier: -1,
      },
      mp: {
        abbreviation: "TERIOCK.STATS.mp.abbreviation",
        harm: "drain",
        icon: icons.stat.mp,
        label: "TERIOCK.COSTS.Primary.mp",
        multiplier: -1,
      },
      lp: {
        abbreviation: "TERIOCK.STATS.lp.abbreviation",
        harm: "wither",
        icon: icons.stat.lp,
        label: "TERIOCK.COSTS.Primary.lp",
        multiplier: +1,
      },
    },
    types: {
      formula: "TERIOCK.COSTS.Types.formula",
      description: "TERIOCK.COSTS.Types.description",
    },
  },
  tweaks: {
    adept: {
      multiplier: -1,
      icon: icons.form.special,
      label: "TERIOCK.COSTS.Tweaks.adept",
      primary: "mp",
    },
    gifted: {
      multiplier: 1,
      icon: icons.form.gifted,
      label: "TERIOCK.COSTS.Tweaks.gifted",
      primary: "mp",
    },
    inept: {
      icon: icons.form.flaw,
      label: "TERIOCK.COSTS.Tweaks.inept",
      multiplier: 1,
      primary: "mp",
    },
  },
};

preLocalize("options.cost.primary.keys", { keys: ["abbreviation", "label"] });
preLocalize("options.cost.primary.types");
preLocalize("options.cost.components.keys");
preLocalize("options.cost.components.types");
preLocalize("options.cost.tweaks", { key: "label" });
