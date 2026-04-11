import { preLocalize } from "../../helpers/localization.mjs";

export const characterOptions = {
  defaults: {
    hiding: "@snk.pas",
    initiative: "1d20 + @mov",
    maxPresence: 1,
    perceiving: "@per.pas",
    weight: "pow(3 + @size, 3)",
  },
  movementTypes: {
    walk: {
      abbreviation: "wal",
      initial: 3,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.walk",
    },
    climb: {
      abbreviation: "cli",
      initial: 1,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.climb",
    },
    crawl: {
      abbreviation: "cra",
      initial: 1,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.crawl",
    },
    difficultTerrain: {
      abbreviation: "dif",
      initial: 2,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.difficultTerrain",
    },
    dig: {
      abbreviation: "dig",
      initial: 0,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.dig",
    },
    dive: {
      abbreviation: "div",
      initial: 0,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.dive",
    },
    fly: {
      abbreviation: "fly",
      initial: 0,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.fly",
    },
    hidden: {
      abbreviation: "hid",
      initial: 1,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.hidden",
    },
    leapHorizontal: {
      abbreviation: "leh",
      initial: 1,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.leapHorizontal",
    },
    leapVertical: {
      abbreviation: "lev",
      initial: 0,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.leapVertical",
    },
    swim: {
      abbreviation: "swi",
      initial: 1,
      label: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.swim",
    },
  },
  senseTypes: {
    blind: {
      detectionMode: "blindFighting",
      grantsSight: false,
      label: "TERIOCK.TERMS.Senses.blind",
    },
    dark: {
      detectionMode: "darkVision",
      grantsSight: true,
      label: "TERIOCK.TERMS.Senses.dark",
      visionMode: "darkvision",
    },
    ethereal: {
      detectionMode: "seeEthereal",
      grantsSight: false,
      label: "TERIOCK.TERMS.Senses.ethereal",
    },
    hearing: {
      detectionMode: "soundPerception",
      grantsSight: false,
      label: "TERIOCK.TERMS.Senses.hearing",
    },
    invisible: {
      detectionMode: "seeInvisible",
      grantsSight: false,
      label: "TERIOCK.TERMS.Senses.invisible",
    },
    sight: {
      grantsSight: true,
      label: "TERIOCK.TERMS.Senses.sight",
    },
    smell: {
      detectionMode: "scentPerception",
      grantsSight: false,
      label: "TERIOCK.TERMS.Senses.smell",
    },
    spectral: {
      hidden: true,
      detectionMode: "spectral",
      grantsSight: true,
      label: "TERIOCK.TERMS.Senses.spectral",
    },
    truth: {
      detectionMode: "trueSight",
      grantsSight: true,
      label: "TERIOCK.TERMS.Senses.truth",
    },
  },
  sizes: /** @type {Teriock.Config.SizeConfig[]} */ [
    {
      max: 0.5,
      length: 0.5,
      category: "TERIOCK.TERMS.Sizes.tiny",
      reach: 5,
    },
    {
      max: 2,
      length: 1,
      category: "TERIOCK.TERMS.Sizes.small",
      reach: 5,
    },
    {
      max: 4,
      length: 1,
      category: "TERIOCK.TERMS.Sizes.medium",
      reach: 5,
    },
    {
      max: 9,
      length: 2,
      category: "TERIOCK.TERMS.Sizes.large",
      reach: 10,
    },
    {
      max: 14,
      length: 3,
      category: "TERIOCK.TERMS.Sizes.huge",
      reach: 15,
    },
    {
      max: 19,
      length: 4,
      category: "TERIOCK.TERMS.Sizes.massive",
      reach: 20,
    },
    {
      max: 24,
      length: 5,
      category: "TERIOCK.TERMS.Sizes.gargantuan",
      reach: 25,
    },
    {
      max: Infinity,
      length: 6,
      category: "TERIOCK.TERMS.Sizes.colossal",
      reach: 30,
    },
  ],
  speedAdjustments: {
    0: { label: "TERIOCK.TERMS.SpeedAdjustments.0", multiplier: 0 },
    1: { label: "TERIOCK.TERMS.SpeedAdjustments.1", multiplier: 0.25 },
    2: { label: "TERIOCK.TERMS.SpeedAdjustments.2", multiplier: 0.5 },
    3: { label: "TERIOCK.TERMS.SpeedAdjustments.3", multiplier: 1 },
    4: { label: "TERIOCK.TERMS.SpeedAdjustments.4", multiplier: 2 },
  },
};

preLocalize("options.character.senseTypes", { key: "label", sort: true });
preLocalize("options.character.speedAdjustments", { keys: ["label"] });
preLocalize("options.character.movementTypes", { key: "label", sort: true });
preLocalize("options.character.sizes", { keys: ["category"] });
