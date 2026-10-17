import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { wikiIndexToConfig } from "../../utils/_module.mjs";

export default {
  effectTypes: wikiIndexToConfig("effect", "TERIOCK.TERMS.EffectTypes"),
  elements: wikiIndexToConfig("element", "TERIOCK.TERMS.Elements"),
  powerSources: wikiIndexToConfig("source", "TERIOCK.TERMS.PowerSources"),
};

preLocalizeConfig("CONFIG.metaphysics.effectTypes", { key: "label" });
preLocalizeConfig("CONFIG.metaphysics.elements", { key: "label" });
preLocalizeConfig("CONFIG.metaphysics.powerSources", { key: "label" });
