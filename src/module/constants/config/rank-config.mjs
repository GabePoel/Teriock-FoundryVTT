import { preLocalize } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

export const rankConfig = {
  everyman: {
    classes: {
      journeyman: { icon: icons.class.journeyman, name: "TERIOCK.TERMS.Everyman.journeyman" },
      tradesman: { icon: icons.class.tradesman, name: "TERIOCK.TERMS.Everyman.tradesman" },
    },
    hp: 10,
    icon: icons.archetype.everyman,
    mp: 10,
    name: "TERIOCK.TERMS.Archetypes.everyman",
  },
  mage: {
    classes: {
      flameMage: { icon: icons.class.flameMage, name: "TERIOCK.TERMS.Classes.flameMage" },
      lifeMage: { icon: icons.class.lifeMage, name: "TERIOCK.TERMS.Classes.lifeMage" },
      natureMage: { icon: icons.class.natureMage, name: "TERIOCK.TERMS.Classes.natureMage" },
      necromancer: { icon: icons.class.necromancer, name: "TERIOCK.TERMS.Classes.necromancer" },
      stormMage: { icon: icons.class.stormMage, name: "TERIOCK.TERMS.Classes.stormMage" },
    },
    hp: 8,
    icon: icons.archetype.mage,
    mp: 12,
    name: "TERIOCK.TERMS.Archetypes.mage",
  },
  semi: {
    classes: {
      archer: { icon: icons.class.archer, name: "TERIOCK.TERMS.Classes.archer" },
      assassin: { icon: icons.class.assassin, name: "TERIOCK.TERMS.Classes.assassin" },
      corsair: { icon: icons.class.corsair, name: "TERIOCK.TERMS.Classes.corsair" },
      ranger: { icon: icons.class.ranger, name: "TERIOCK.TERMS.Classes.ranger" },
      thief: { icon: icons.class.thief, name: "TERIOCK.TERMS.Classes.thief" },
    },
    hp: 10,
    icon: icons.archetype.semi,
    mp: 10,
    name: "TERIOCK.TERMS.Archetypes.semi",
  },
  warrior: {
    classes: {
      berserker: { icon: icons.class.berserker, name: "TERIOCK.TERMS.Classes.berserker" },
      duelist: { icon: icons.class.duelist, name: "TERIOCK.TERMS.Classes.duelist" },
      knight: { icon: icons.class.knight, name: "TERIOCK.TERMS.Classes.knight" },
      paladin: { icon: icons.class.paladin, name: "TERIOCK.TERMS.Classes.paladin" },
      veteran: { icon: icons.class.veteran, name: "TERIOCK.TERMS.Classes.veteran" },
    },
    hp: 12,
    icon: icons.archetype.warrior,
    mp: 8,
    name: "TERIOCK.TERMS.Archetypes.warrior",
  },
};

preLocalize("config.rank", { keys: ["name"] });
preLocalize("config.rank.mage.classes", { keys: ["name"] });
preLocalize("config.rank.semi.classes", { keys: ["name"] });
preLocalize("config.rank.warrior.classes", { keys: ["name"] });
preLocalize("config.rank.everyman.classes", { keys: ["name"] });
