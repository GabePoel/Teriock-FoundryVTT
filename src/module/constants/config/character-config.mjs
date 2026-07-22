import { preLocalizeConfig } from "../../helpers/localization.mjs";

export default {
  defaults: { initiative: { base: "1d20", bonus: "@mov.score", competence: "@p" }, maxPresence: 1 },
  movement: {
    climb: { initial: 1, label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.climb" },
    crawl: { initial: 1, label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.crawl" },
    difficultTerrain: { initial: 2, label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.difficultTerrain" },
    dig: { initial: 0, label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.dig" },
    dive: { initial: 0, label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.dive" },
    fly: { initial: 0, label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.fly" },
    hidden: { initial: 1, label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.hidden" },
    leapHorizontal: { initial: 1, label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.leapHorizontal" },
    leapVertical: { initial: 0, label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.leapVertical" },
    swim: { initial: 1, label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.swim" },
    walk: { initial: 3, label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.walk" },
  },
  sense: {
    blind: { detectionMode: "blindFighting", grantsSight: false, label: "TERIOCK.TERMS.Senses.blind" },
    dark: {
      detectionMode: "darkVision",
      grantsSight: true,
      label: "TERIOCK.TERMS.Senses.dark",
      visionMode: "darkvision",
    },
    ethereal: { detectionMode: "seeEthereal", grantsSight: false, label: "TERIOCK.TERMS.Senses.ethereal" },
    hearing: { detectionMode: "soundPerception", grantsSight: false, label: "TERIOCK.TERMS.Senses.hearing" },
    invisible: { detectionMode: "seeInvisible", grantsSight: false, label: "TERIOCK.TERMS.Senses.invisible" },
    sight: { grantsSight: true, label: "TERIOCK.TERMS.Senses.sight" },
    smell: { detectionMode: "scentPerception", grantsSight: false, label: "TERIOCK.TERMS.Senses.smell" },
    truth: { detectionMode: "trueSight", grantsSight: true, label: "TERIOCK.TERMS.Senses.truth" },
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
