import { preLocalizeObject } from "../../helpers/localization.mjs";
import { wikiIndexToConfig } from "../../utils/_module.mjs";

export default {
  effectTypes: wikiIndexToConfig("effect", "TERIOCK.TERMS.EffectTypes"),
  elements: wikiIndexToConfig("element", "TERIOCK.TERMS.Elements"),
  powerSources: wikiIndexToConfig("source", "TERIOCK.TERMS.PowerSources"),
};

preLocalizeObject("CONFIG.metaphysics.effectTypes", { key: "label" });
preLocalizeObject("CONFIG.metaphysics.elements", { key: "label" });
preLocalizeObject("CONFIG.metaphysics.powerSources", { key: "label" });
