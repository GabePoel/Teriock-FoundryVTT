import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { icons } from "../display/_module.mjs";

export default {
  defaults: { initiative: { base: "1d20", bonus: "@mov.score", competence: "@p" }, maxPresence: 1 },
  movement: {
    climb: {
      icon: icons.manifest.movement.climb,
      initial: 1,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.climb",
    },
    crawl: {
      icon: icons.manifest.movement.crawl,
      initial: 1,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.crawl",
    },
    difficultTerrain: {
      icon: icons.manifest.movement.difficultTerrain,
      initial: 2,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.difficultTerrain",
    },
    dig: {
      icon: icons.manifest.movement.dig,
      initial: 0,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.dig",
    },
    dive: {
      icon: icons.manifest.movement.dive,
      initial: 0,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.dive",
    },
    fly: {
      icon: icons.manifest.movement.fly,
      initial: 0,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.fly",
    },
    hidden: {
      icon: icons.manifest.movement.hidden,
      initial: 1,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.hidden",
    },
    leapHorizontal: {
      icon: icons.manifest.movement.leapHorizontal,
      initial: 1,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.leapHorizontal",
    },
    leapVertical: {
      icon: icons.manifest.movement.leapVertical,
      initial: 0,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.leapVertical",
    },
    swim: {
      icon: icons.manifest.movement.swim,
      initial: 1,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.swim",
    },
    walk: {
      icon: icons.manifest.movement.walk,
      initial: 3,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.walk",
    },
  },
  sense: {
    blind: {
      detectionMode: "blindFighting",
      grantsSight: false,
      icon: icons.manifest.sense.blind,
      label: "TERIOCK.TERMS.Senses.blind",
    },
    dark: {
      detectionMode: "darkVision",
      grantsSight: true,
      icon: icons.manifest.sense.dark,
      label: "TERIOCK.TERMS.Senses.dark",
      visionMode: "darkvision",
    },
    ethereal: {
      detectionMode: "seeEthereal",
      grantsSight: false,
      icon: icons.manifest.sense.ethereal,
      label: "TERIOCK.TERMS.Senses.ethereal",
    },
    hearing: {
      detectionMode: "soundPerception",
      grantsSight: false,
      icon: icons.manifest.sense.hearing,
      label: "TERIOCK.TERMS.Senses.hearing",
    },
    invisible: {
      detectionMode: "seeInvisible",
      grantsSight: false,
      icon: icons.manifest.sense.invisible,
      label: "TERIOCK.TERMS.Senses.invisible",
    },
    sight: { grantsSight: false, icon: icons.manifest.sense.sight, label: "TERIOCK.TERMS.Senses.sight" },
    smell: {
      detectionMode: "scentPerception",
      grantsSight: false,
      icon: icons.manifest.sense.smell,
      label: "TERIOCK.TERMS.Senses.smell",
    },
    truth: {
      detectionMode: "trueSight",
      grantsSight: false,
      icon: icons.manifest.sense.truth,
      label: "TERIOCK.TERMS.Senses.truth",
    },
  },
  sizes: /** @type {Teriock.Config.SizeEntry[]} */ [
    { category: "TERIOCK.TERMS.Sizes.tiny", length: 0.5, max: 0.5, reach: 5 },
    { category: "TERIOCK.TERMS.Sizes.small", length: 1, max: 2, reach: 5 },
    { category: "TERIOCK.TERMS.Sizes.medium", length: 1, max: 4, reach: 5 },
    { category: "TERIOCK.TERMS.Sizes.large", length: 2, max: 9, reach: 10 },
    { category: "TERIOCK.TERMS.Sizes.huge", length: 3, max: 14, reach: 15 },
    { category: "TERIOCK.TERMS.Sizes.massive", length: 4, max: 19, reach: 20 },
    { category: "TERIOCK.TERMS.Sizes.gargantuan", length: 5, max: 24, reach: 25 },
    { category: "TERIOCK.TERMS.Sizes.colossal", length: 6, max: Infinity, reach: 30 },
  ],
  speed: {
    0: { label: "TERIOCK.TERMS.SpeedAdjustments.0", multiplier: 0 },
    1: { label: "TERIOCK.TERMS.SpeedAdjustments.1", multiplier: 0.25 },
    2: { label: "TERIOCK.TERMS.SpeedAdjustments.2", multiplier: 0.5 },
    3: { label: "TERIOCK.TERMS.SpeedAdjustments.3", multiplier: 1 },
    4: { label: "TERIOCK.TERMS.SpeedAdjustments.4", multiplier: 2 },
  },
  tabs: [
    { gapless: true, key: "Abilities", size: "small" },
    { key: "Classes" },
    { gapless: true, key: "Effects", size: "small" },
    { gapless: true, key: "Inventory", size: "small" },
    { key: "Powers" },
    { key: "Resources" },
    { key: "Tradecrafts" },
  ],
};

preLocalizeConfig("config.character.movement", { key: "label" });
preLocalizeConfig("config.character.sense", { key: "label" });
preLocalizeConfig("config.character.sizes", { keys: ["category"] });
preLocalizeConfig("config.character.speed", { keys: ["label"] });
