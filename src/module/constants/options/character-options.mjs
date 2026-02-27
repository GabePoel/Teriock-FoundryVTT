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
    hearing: "TERIOCK.TERMS.Senses.hearing",
    smell: "TERIOCK.TERMS.Senses.smell",
    blind: "TERIOCK.TERMS.Senses.blind",
    dark: "TERIOCK.TERMS.Senses.dark",
    ethereal: "TERIOCK.TERMS.Senses.ethereal",
    invisible: "TERIOCK.TERMS.Senses.invisible",
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
};

preLocalize("options.character.senses");
preLocalize("options.character.speedAdjustments");
preLocalize("options.character.movementTypes");
