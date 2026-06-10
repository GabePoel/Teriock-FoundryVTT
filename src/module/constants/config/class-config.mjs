import { preLocalize } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

export default {
  archetypes: {
    everyman: {
      dontStage: true,
      icon: icons.archetype.everyman,
      label: "TERIOCK.TERMS.Archetypes.everyman",
      stats: { hp: 10, mp: 10 },
    },
    mage: { icon: icons.archetype.mage, label: "TERIOCK.TERMS.Archetypes.mage", stats: { hp: 8, mp: 12 } },
    semi: { icon: icons.archetype.semi, label: "TERIOCK.TERMS.Archetypes.semi", stats: { hp: 10, mp: 10 } },
    warrior: { icon: icons.archetype.warrior, label: "TERIOCK.TERMS.Archetypes.warrior", stats: { hp: 12, mp: 8 } },
  },
  classes: {
    archer: { archetype: "semi", icon: icons.class.archer, label: "TERIOCK.TERMS.Classes.archer" },
    assassin: { archetype: "semi", icon: icons.class.assassin, label: "TERIOCK.TERMS.Classes.assassin" },
    berserker: { archetype: "warrior", icon: icons.class.berserker, label: "TERIOCK.TERMS.Classes.berserker" },
    corsair: { archetype: "semi", icon: icons.class.corsair, label: "TERIOCK.TERMS.Classes.corsair" },
    duelist: { archetype: "warrior", icon: icons.class.duelist, label: "TERIOCK.TERMS.Classes.duelist" },
    flameMage: { archetype: "mage", icon: icons.class.flameMage, label: "TERIOCK.TERMS.Classes.flameMage" },
    journeyman: { archetype: "everyman", icon: icons.class.journeyman, label: "TERIOCK.TERMS.Everyman.journeyman" },
    knight: { archetype: "warrior", icon: icons.class.knight, label: "TERIOCK.TERMS.Classes.knight" },
    lifeMage: { archetype: "mage", icon: icons.class.lifeMage, label: "TERIOCK.TERMS.Classes.lifeMage" },
    natureMage: { archetype: "mage", icon: icons.class.natureMage, label: "TERIOCK.TERMS.Classes.natureMage" },
    necromancer: { archetype: "mage", icon: icons.class.necromancer, label: "TERIOCK.TERMS.Classes.necromancer" },
    paladin: { archetype: "warrior", icon: icons.class.paladin, label: "TERIOCK.TERMS.Classes.paladin" },
    ranger: { archetype: "semi", icon: icons.class.ranger, label: "TERIOCK.TERMS.Classes.ranger" },
    stormMage: { archetype: "mage", icon: icons.class.stormMage, label: "TERIOCK.TERMS.Classes.stormMage" },
    thief: { archetype: "semi", icon: icons.class.thief, label: "TERIOCK.TERMS.Classes.thief" },
    tradesman: { archetype: "everyman", icon: icons.class.tradesman, label: "TERIOCK.TERMS.Everyman.tradesman" },
    veteran: { archetype: "warrior", icon: icons.class.veteran, label: "TERIOCK.TERMS.Classes.veteran" },
  },
  defaults: { maxAv: 2 },
};

preLocalize("config.class.archetypes", { keys: ["label"] });
preLocalize("config.class.classes", { keys: ["label"] });
