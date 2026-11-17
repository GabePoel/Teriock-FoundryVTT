import { preLocalizeObject } from "../../helpers/localization.mjs";
import { wikiIndexToConfig } from "../../utils/_module.mjs";

export default {
  effectTypes: wikiIndexToConfig("effect", "TERIOCK.TERMS.EffectTypes"),
  elements: wikiIndexToConfig("element", "TERIOCK.TERMS.Elements"),
  illusionLevels: {
    0: "COMMON.None",
    1: "TERIOCK.EFFECTS.IllusionLevel.minor",
    2: "TERIOCK.EFFECTS.IllusionLevel.full",
    3: "TERIOCK.EFFECTS.IllusionLevel.greater",
  },
  powerSources: wikiIndexToConfig("source", "TERIOCK.TERMS.PowerSources"),
  transformationLevels: {
    0: "COMMON.None",
    1: "TERIOCK.EFFECTS.TransformationLevel.minor",
    2: "TERIOCK.EFFECTS.TransformationLevel.full",
    3: "TERIOCK.EFFECTS.TransformationLevel.greater",
  },
};

preLocalizeObject("CONFIG.metaphysics.effectTypes", { key: "label" });
preLocalizeObject("CONFIG.metaphysics.elements", { key: "label" });
preLocalizeObject("CONFIG.metaphysics.illusionLevels");
preLocalizeObject("CONFIG.metaphysics.powerSources", { key: "label" });
preLocalizeObject("CONFIG.metaphysics.transformationLevels");
