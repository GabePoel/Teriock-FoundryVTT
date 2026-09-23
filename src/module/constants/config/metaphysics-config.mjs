import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { wikiIndexToConfig } from "../../helpers/utils.mjs";

export default {
  effectTypes: wikiIndexToConfig("effect", "TERIOCK.TERMS.EffectTypes"),
  elements: wikiIndexToConfig("element", "TERIOCK.TERMS.Elements"),
  powerSources: wikiIndexToConfig("source", "TERIOCK.TERMS.PowerSources"),
};

preLocalizeConfig("config.metaphysics.effectTypes", { key: "label" });
preLocalizeConfig("config.metaphysics.elements", { key: "label" });
preLocalizeConfig("config.metaphysics.powerSources", { key: "label" });
