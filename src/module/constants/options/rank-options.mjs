import { preLocalize } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

export const rankOptions = {
  mage: {
    classes: {
      flameMage: {
        name: "TERIOCK.TERMS.Classes.flameMage",
        icon: icons.class.flameMage,
      },
      lifeMage: {
        name: "TERIOCK.TERMS.Classes.lifeMage",
        icon: icons.class.lifeMage,
      },
      natureMage: {
        name: "TERIOCK.TERMS.Classes.natureMage",
        icon: icons.class.natureMage,
      },
      necromancer: {
        name: "TERIOCK.TERMS.Classes.necromancer",
        icon: icons.class.necromancer,
      },
      stormMage: {
        name: "TERIOCK.TERMS.Classes.stormMage",
        icon: icons.class.stormMage,
      },
    },
    hp: 8,
    icon: icons.archetype.mage,
    mp: 12,
    name: "TERIOCK.TERMS.Archetypes.mage",
  },
  semi: {
    classes: {
      archer: {
        name: "TERIOCK.TERMS.Classes.archer",
        icon: icons.class.archer,
      },
      assassin: {
        name: "TERIOCK.TERMS.Classes.assassin",
        icon: icons.class.assassin,
      },
      corsair: {
        name: "TERIOCK.TERMS.Classes.corsair",
        icon: icons.class.corsair,
      },
      ranger: {
        name: "TERIOCK.TERMS.Classes.ranger",
        icon: icons.class.ranger,
      },
      thief: {
        name: "TERIOCK.TERMS.Classes.thief",
        icon: icons.class.thief,
      },
    },
    hp: 10,
    icon: icons.archetype.semi,
    mp: 10,
    name: "TERIOCK.TERMS.Archetypes.semi",
  },
  warrior: {
    classes: {
      berserker: {
        name: "TERIOCK.TERMS.Classes.berserker",
        icon: icons.class.berserker,
      },
      duelist: {
        name: "TERIOCK.TERMS.Classes.duelist",
        icon: icons.class.duelist,
      },
      knight: {
        name: "TERIOCK.TERMS.Classes.knight",
        icon: icons.class.knight,
      },
      paladin: {
        name: "TERIOCK.TERMS.Classes.paladin",
        icon: icons.class.paladin,
      },
      veteran: {
        name: "TERIOCK.TERMS.Classes.veteran",
        icon: icons.class.veteran,
      },
    },
    hp: 12,
    icon: icons.archetype.warrior,
    mp: 8,
    name: "TERIOCK.TERMS.Archetypes.warrior",
  },
  everyman: {
    classes: {
      tradesman: {
        name: "TERIOCK.TERMS.Classes.tradesman",
        icon: icons.class.tradesman,
      },
      journeyman: {
        name: "TERIOCK.TERMS.Classes.journeyman",
        icon: icons.class.journeyman,
      },
    },
    hp: 10,
    icon: icons.archetype.everyman,
    mp: 10,
    name: "TERIOCK.TERMS.Archetypes.everyman",
  },
};

preLocalize("options.rank", { keys: ["name"] });
preLocalize("options.rank.mage.classes", { keys: ["name"] });
preLocalize("options.rank.semi.classes", { keys: ["name"] });
preLocalize("options.rank.warrior.classes", { keys: ["name"] });
preLocalize("options.rank.everyman.classes", { keys: ["name"] });
