import { preLocalize } from "../../helpers/localization.mjs";

export const characterOptions = {
  defaultLight: {
    negative: false,
    priority: 0,
    alpha: 0.5,
    angle: 360,
    bright: 0,
    color: "#000000",
    coloration: 1,
    dim: 0,
    attenuation: 0.5,
    luminosity: 0.5,
    saturation: 0,
    contrast: 0,
    shadows: 0,
    animation: {
      type: null,
      speed: 5,
      intensity: 5,
      reverse: false,
    },
    darkness: {
      min: 0,
      max: 1,
    },
  },
  defaults: {
    hiding: "@snk.pas",
    initiative: "1d20 + @mov",
    perceiving: "@per.pas",
    weight: "pow(3 + @size, 3)",
  },
  initiative: "1d20 + @mov",
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
  senseMap: {
    blind: "blindFighting",
    dark: "darkVision",
    ethereal: "seeEthereal",
    etherealLight: "etherealLight",
    hearing: "soundPerception",
    invisible: "seeInvisible",
    smell: "scentPerception",
    truth: "trueSight",
  },
  senses: {
    blind: "TERIOCK.TERMS.Senses.blind",
    dark: "TERIOCK.TERMS.Senses.dark",
    ethereal: "TERIOCK.TERMS.Senses.ethereal",
    hearing: "TERIOCK.TERMS.Senses.hearing",
    invisible: "TERIOCK.TERMS.Senses.invisible",
    sight: "TERIOCK.TERMS.Senses.sight",
    smell: "TERIOCK.TERMS.Senses.smell",
    truth: "TERIOCK.TERMS.Senses.truth",
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

preLocalize("options.character.senses");
preLocalize("options.character.speedAdjustments", { keys: ["label"] });
preLocalize("options.character.movementTypes", { keys: ["label"] });
preLocalize("options.character.sizes", { keys: ["category"] });
