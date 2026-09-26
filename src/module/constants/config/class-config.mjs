import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { colors, icons, thumbnails } from "../display/_module.mjs";
import systemConfig from "./system-config.mjs";

export default {
  archetypes: {
    everyman: {
      dontStage: true,
      icon: icons.manifest.archetype.everyman,
      img: thumbnails.manifest.archetype.everyman,
      label: "TERIOCK.TERMS.Archetypes.everyman",
      stats: { hp: 10, mp: 10 },
    },
    mage: {
      icon: icons.manifest.archetype.mage,
      img: thumbnails.manifest.archetype.mage,
      label: "TERIOCK.TERMS.Archetypes.mage",
      stats: { hp: 8, mp: 12 },
    },
    semi: {
      icon: icons.manifest.archetype.semi,
      img: thumbnails.manifest.archetype.semi,
      label: "TERIOCK.TERMS.Archetypes.semi",
      stats: { hp: 10, mp: 10 },
    },
    warrior: {
      icon: icons.manifest.archetype.warrior,
      img: thumbnails.manifest.archetype.warrior,
      label: "TERIOCK.TERMS.Archetypes.warrior",
      stats: { hp: 12, mp: 8 },
    },
  },
  classes: {
    archer: {
      archetype: "semi",
      icon: icons.manifest.class.archer,
      img: thumbnails.manifest.class.archer,
      label: "TERIOCK.TERMS.Classes.archer",
    },
    assassin: {
      archetype: "semi",
      icon: icons.manifest.class.assassin,
      img: thumbnails.manifest.class.assassin,
      label: "TERIOCK.TERMS.Classes.assassin",
    },
    berserker: {
      archetype: "warrior",
      icon: icons.manifest.class.berserker,
      img: thumbnails.manifest.class.berserker,
      label: "TERIOCK.TERMS.Classes.berserker",
    },
    corsair: {
      archetype: "semi",
      icon: icons.manifest.class.corsair,
      img: thumbnails.manifest.class.corsair,
      label: "TERIOCK.TERMS.Classes.corsair",
    },
    duelist: {
      archetype: "warrior",
      icon: icons.manifest.class.duelist,
      img: thumbnails.manifest.class.duelist,
      label: "TERIOCK.TERMS.Classes.duelist",
    },
    "flame-mage": {
      archetype: "mage",
      icon: icons.manifest.class.flameMage,
      img: thumbnails.manifest.class.flameMage,
      label: "TERIOCK.TERMS.Classes.flameMage",
    },
    journeyman: {
      archetype: "everyman",
      icon: icons.manifest.class.journeyman,
      img: thumbnails.manifest.class.journeyman,
      label: "TERIOCK.TERMS.Everyman.journeyman",
    },
    knight: {
      archetype: "warrior",
      icon: icons.manifest.class.knight,
      img: thumbnails.manifest.class.knight,
      label: "TERIOCK.TERMS.Classes.knight",
    },
    "life-mage": {
      archetype: "mage",
      icon: icons.manifest.class.lifeMage,
      img: thumbnails.manifest.class.lifeMage,
      label: "TERIOCK.TERMS.Classes.lifeMage",
    },
    "nature-mage": {
      archetype: "mage",
      icon: icons.manifest.class.natureMage,
      img: thumbnails.manifest.class.natureMage,
      label: "TERIOCK.TERMS.Classes.natureMage",
    },
    necromancer: {
      archetype: "mage",
      icon: icons.manifest.class.necromancer,
      img: thumbnails.manifest.class.necromancer,
      label: "TERIOCK.TERMS.Classes.necromancer",
    },
    paladin: {
      archetype: "warrior",
      icon: icons.manifest.class.paladin,
      img: thumbnails.manifest.class.paladin,
      label: "TERIOCK.TERMS.Classes.paladin",
    },
    ranger: {
      archetype: "semi",
      icon: icons.manifest.class.ranger,
      img: thumbnails.manifest.class.ranger,
      label: "TERIOCK.TERMS.Classes.ranger",
    },
    "storm-mage": {
      archetype: "mage",
      icon: icons.manifest.class.stormMage,
      img: thumbnails.manifest.class.stormMage,
      label: "TERIOCK.TERMS.Classes.stormMage",
    },
    thief: {
      archetype: "semi",
      icon: icons.manifest.class.thief,
      img: thumbnails.manifest.class.thief,
      label: "TERIOCK.TERMS.Classes.thief",
    },
    tradesman: {
      archetype: "everyman",
      icon: icons.manifest.class.tradesman,
      img: thumbnails.manifest.class.tradesman,
      label: "TERIOCK.TERMS.Everyman.tradesman",
    },
    veteran: {
      archetype: "warrior",
      icon: icons.manifest.class.veteran,
      img: thumbnails.manifest.class.veteran,
      label: "TERIOCK.TERMS.Classes.veteran",
    },
  },
  defaults: { maxAv: 2 },
  kind: /** @enum {Teriock.Config.KindEntry} */ {
    innate: { color: colors.palette.purple, icon: icons.manifest.power.innate, label: "TERIOCK.TERMS.RankKind.innate" },
    learned: {
      color: colors.palette.green,
      icon: icons.manifest.power.learned,
      label: "TERIOCK.TERMS.RankKind.learned",
    },
    ...systemConfig.childKinds,
  },
};

preLocalizeConfig("config.class.archetypes", { keys: ["label"] });
preLocalizeConfig("config.class.classes", { keys: ["label"] });
preLocalizeConfig("config.class.kind", { keys: ["label"] });
