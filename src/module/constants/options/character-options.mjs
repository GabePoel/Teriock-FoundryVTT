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
};

preLocalize("options.character.senses");
preLocalize("options.character.speedAdjustments");
