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
    walk: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.walk",
    climb: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.climb",
    crawl: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.crawl",
    difficultTerrain:
      "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.difficultTerrain",
    dig: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.dig",
    dive: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.dive",
    fly: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.fly",
    hidden: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.hidden",
    leapHorizontal:
      "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.leapHorizontal",
    leapVertical:
      "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.leapVertical",
    swim: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.swim",
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
    0: "TERIOCK.TERMS.SpeedAdjustments.0",
    1: "TERIOCK.TERMS.SpeedAdjustments.1",
    2: "TERIOCK.TERMS.SpeedAdjustments.2",
    3: "TERIOCK.TERMS.SpeedAdjustments.3",
    4: "TERIOCK.TERMS.SpeedAdjustments.4",
  },
};

preLocalize("options.character.senses");
preLocalize("options.character.speedAdjustments");
preLocalize("options.character.movementTypes");
preLocalize("options.character.sizes", { keys: ["category"] });
