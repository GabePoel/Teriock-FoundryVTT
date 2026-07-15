import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { colors } from "../display/colors.mjs";
import { icons } from "../display/icons.mjs";
import currencyConfig from "./currency-config.mjs";
import systemConfig from "./system-config.mjs";

export default {
  hp: {
    abbreviation: "TERIOCK.STATS.hp.abbreviation",
    bar: { class: "hit", initial: 1, lockInputs: true, temp: true },
    color: colors.hp,
    die: "hit",
    hacks: true,
    icon: icons.stat.hp,
    impact: "damage",
    label: "TERIOCK.COSTS.Primary.hp",
    morganti: true,
    multiplier: -1,
    pool: {
      enabled: true,
      img: "Hit Die",
      panel: { name: "TERIOCK.MODELS.HpPool.PANELS.name", text: "TERIOCK.MODELS.HpPool.PANELS.text" },
    },
    style: { colorset: "red" },
    transformationReset: { initial: true, update: { "system.hp.value": systemConfig.inf } },
  },

  mp: {
    abbreviation: "TERIOCK.STATS.mp.abbreviation",
    bar: { class: "mana", initial: 1, temp: true },
    color: colors.mp,
    die: "mana",
    icon: icons.stat.mp,
    impact: "drain",
    label: "TERIOCK.COSTS.Primary.mp",
    morganti: true,
    multiplier: -1,
    pool: {
      enabled: true,
      img: "Mana Die",
      panel: { name: "TERIOCK.MODELS.MpPool.PANELS.name", text: "TERIOCK.MODELS.MpPool.PANELS.text" },
    },
    style: { colorset: "blue" },
    transformationReset: { initial: false, update: { "system.mp.value": systemConfig.inf } },
  },

  lp: {
    abbreviation: "TERIOCK.STATS.lp.abbreviation",
    bar: { class: "lifespan", initial: 20, max: 100 },
    color: colors.lp,
    icon: icons.stat.lp,
    impact: "wither",
    label: "TERIOCK.COSTS.Primary.lp",
    multiplier: +1,
    transformationReset: { initial: false, update: { "system.lp.value": 20 } },
  },

  gp: {
    abbreviation: "TERIOCK.STATS.gp.abbreviation",
    icon: icons.stat.gp,
    impact: "pay",
    label: "TERIOCK.COSTS.Primary.gp",
    multiplier: -1,
    transformationReset: {
      initial: true,
      update: Object.fromEntries(Object.keys(currencyConfig).map(k => [`system.money.${k}`, 0])),
    },
  },
};

preLocalizeConfig("config.stat", { keys: ["abbreviation", "label"] });
