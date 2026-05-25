import { preLocalize } from "../../helpers/localization.mjs";
import { toCamelCase } from "../../helpers/string.mjs";
import { icons } from "../display/icons.mjs";

/** @param {Teriock.Keys.Class} id */
const classIcon = id => icons.class[toCamelCase(id)];

export const rankConfig = {
  everyman: {
    classes: {
      journeyman: { icon: classIcon("journeyman"), name: "TERIOCK.TERMS.Everyman.journeyman" },
      tradesman: { icon: classIcon("tradesman"), name: "TERIOCK.TERMS.Everyman.tradesman" },
    },
    hp: 10,
    icon: icons.archetype.everyman,
    mp: 10,
    name: "TERIOCK.TERMS.Archetypes.everyman",
  },
  mage: {
    classes: {
      flameMage: { icon: classIcon("flameMage"), name: "TERIOCK.TERMS.Classes.flameMage" },
      lifeMage: { icon: classIcon("lifeMage"), name: "TERIOCK.TERMS.Classes.lifeMage" },
      natureMage: { icon: classIcon("natureMage"), name: "TERIOCK.TERMS.Classes.natureMage" },
      necromancer: { icon: classIcon("necromancer"), name: "TERIOCK.TERMS.Classes.necromancer" },
      stormMage: { icon: classIcon("stormMage"), name: "TERIOCK.TERMS.Classes.stormMage" },
    },
    hp: 8,
    icon: icons.archetype.mage,
    mp: 12,
    name: "TERIOCK.TERMS.Archetypes.mage",
  },
  semi: {
    classes: {
      archer: { icon: classIcon("archer"), name: "TERIOCK.TERMS.Classes.archer" },
      assassin: { icon: classIcon("assassin"), name: "TERIOCK.TERMS.Classes.assassin" },
      corsair: { icon: classIcon("corsair"), name: "TERIOCK.TERMS.Classes.corsair" },
      ranger: { icon: classIcon("ranger"), name: "TERIOCK.TERMS.Classes.ranger" },
      thief: { icon: classIcon("thief"), name: "TERIOCK.TERMS.Classes.thief" },
    },
    hp: 10,
    icon: icons.archetype.semi,
    mp: 10,
    name: "TERIOCK.TERMS.Archetypes.semi",
  },
  warrior: {
    classes: {
      berserker: { icon: classIcon("berserker"), name: "TERIOCK.TERMS.Classes.berserker" },
      duelist: { icon: classIcon("duelist"), name: "TERIOCK.TERMS.Classes.duelist" },
      knight: { icon: classIcon("knight"), name: "TERIOCK.TERMS.Classes.knight" },
      paladin: { icon: classIcon("paladin"), name: "TERIOCK.TERMS.Classes.paladin" },
      veteran: { icon: classIcon("veteran"), name: "TERIOCK.TERMS.Classes.veteran" },
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
