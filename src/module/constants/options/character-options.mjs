import { preLocalize } from "../../helpers/localization.mjs";

export const characterOptions = {
  initiative: "1d20 + @mov",
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
  speedAdjustments: {
    0: "TERIOCK.TERMS.SpeedAdjustments.0",
    1: "TERIOCK.TERMS.SpeedAdjustments.1",
    2: "TERIOCK.TERMS.SpeedAdjustments.2",
    3: "TERIOCK.TERMS.SpeedAdjustments.3",
    4: "TERIOCK.TERMS.SpeedAdjustments.4",
  },
  movementTypes: {
    walk: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.walk",
    difficultTerrain:
      "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.difficultTerrain",
    crawl: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.crawl",
    swim: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.swim",
    climb: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.climb",
    hidden: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.hidden",
    leapHorizontal:
      "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.leapHorizontal",
    leapVertical:
      "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.leapVertical",
    fly: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.fly",
    dig: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.dig",
    dive: "TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.dive",
  },
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
};

preLocalize("options.character.senses");
preLocalize("options.character.speedAdjustments");
preLocalize("options.character.movementTypes");
