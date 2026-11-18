import { preLocalizeObject } from "../../helpers/localization.mjs";
import { wikiIndexToConfig } from "../../utils/_module.mjs";
import { thumbnails } from "../display/_module.mjs";

export default {
  effectTypes: wikiIndexToConfig("effect", "TERIOCK.TERMS.EffectTypes"),
  elements: {
    celestial: { extra: true, img: thumbnails.manifest.element.celestial, label: "TERIOCK.TERMS.Elements.celestial" },
    flame: { img: thumbnails.manifest.element.flame, label: "TERIOCK.TERMS.Elements.flame" },
    life: { img: thumbnails.manifest.element.life, label: "TERIOCK.TERMS.Elements.life" },
    nature: { img: thumbnails.manifest.element.nature, label: "TERIOCK.TERMS.Elements.nature" },
    necromancy: { img: thumbnails.manifest.element.necromancy, label: "TERIOCK.TERMS.Elements.necromancy" },
    storm: { img: thumbnails.manifest.element.storm, label: "TERIOCK.TERMS.Elements.storm" },
  },
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
