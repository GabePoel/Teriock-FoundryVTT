import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { INF } from "../const.mjs";
import { colors, icons, thumbnails } from "../display/_module.mjs";
import currencyConfig from "./currency-config.mjs";

export default {
  hp: {
    abbreviation: "TERIOCK.STATS.hp.abbreviation",
    bar: { class: "hit", initial: 1, lockInputs: true, temp: true },
    color: colors.hp,
    costIdentifier: "core:hp-costs",
    die: "hit",
    hacks: true,
    icon: icons.manifest.stat.hp,
    impact: "damage",
    label: "TERIOCK.COSTS.Primary.hp",
    morganti: true,
    multiplier: -1,
    pool: {
      enabled: true,
      icons: { disabled: icons.manifest.stat.hpOff, enabled: icons.manifest.stat.hpOn },
      img: thumbnails.manifest.misc.hitDie,
      panel: { name: "TERIOCK.MODELS.HpPool.PANELS.name", text: "TERIOCK.MODELS.HpPool.PANELS.text" },
    },
    style: { colorset: "red" },
    transformationReset: { initial: true, update: { "system.hp.value": INF } },
  },

  mp: {
    abbreviation: "TERIOCK.STATS.mp.abbreviation",
    bar: { class: "mana", initial: 1, temp: true },
    color: colors.mp,
    costIdentifier: "core:mp-costs",
    die: "mana",
    icon: icons.manifest.stat.mp,
    impact: "drain",
    label: "TERIOCK.COSTS.Primary.mp",
    morganti: true,
    multiplier: -1,
    pool: {
      enabled: true,
      icons: { disabled: icons.manifest.stat.mpOff, enabled: icons.manifest.stat.mpOn },
      img: thumbnails.manifest.misc.manaDie,
      panel: { name: "TERIOCK.MODELS.MpPool.PANELS.name", text: "TERIOCK.MODELS.MpPool.PANELS.text" },
    },
    style: { colorset: "blue" },
    transformationReset: { initial: false, update: { "system.mp.value": INF } },
  },

  lp: {
    abbreviation: "TERIOCK.STATS.lp.abbreviation",
    bar: { class: "lifespan", initial: 20, max: 100 },
    color: colors.lp,
    costIdentifier: "core:costs",
    icon: icons.manifest.stat.lp,
    impact: "wither",
    label: "TERIOCK.COSTS.Primary.lp",
    multiplier: +1,
    transformationReset: { initial: false, update: { "system.lp.value": 20 } },
  },

  gp: {
    abbreviation: "TERIOCK.STATS.gp.abbreviation",
    costIdentifier: "core:costs",
    icon: icons.manifest.stat.gp,
    impact: "pay",
    label: "TERIOCK.COSTS.Primary.gp",
    multiplier: -1,
    transformationReset: {
      initial: true,
      update: Object.fromEntries(Object.keys(currencyConfig).map(k => [`system.money.${k}`, 0])),
    },
  },
};

preLocalizeConfig("CONFIG.stat", { keys: ["abbreviation", "label"] });
