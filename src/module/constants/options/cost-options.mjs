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
        icon: icons.stat.gp,
        label: "TERIOCK.COSTS.Primary.gp",
      },
      hp: {
        abbreviation: "TERIOCK.STATS.hp.abbreviation",
        icon: icons.stat.hp,
        label: "TERIOCK.COSTS.Primary.hp",
      },
      mp: {
        abbreviation: "TERIOCK.STATS.mp.abbreviation",
        icon: icons.stat.mp,
        label: "TERIOCK.COSTS.Primary.mp",
      },
    },
    types: {
      formula: "TERIOCK.COSTS.Types.formula",
      description: "TERIOCK.COSTS.Types.description",
    },
  },
  tweaks: {
    adept: {
      amount: -1,
      icon: icons.form.special,
      label: "TERIOCK.COSTS.Tweaks.adept",
      primary: "mp",
    },
    gifted: {
      amount: 1,
      icon: icons.form.gifted,
      label: "TERIOCK.COSTS.Tweaks.gifted",
      primary: "mp",
    },
    inept: {
      amount: 1,
      icon: icons.form.flaw,
      label: "TERIOCK.COSTS.Tweaks.inept",
      primary: "mp",
    },
  },
};

preLocalize("options.cost.primary.keys", { keys: ["abbreviation", "label"] });
preLocalize("options.cost.primary.types");
preLocalize("options.cost.components.keys");
preLocalize("options.cost.components.types");
preLocalize("options.cost.tweaks", { key: "label" });
