import affinityConfig from "../../../../constants/config/affinity-config.mjs";
import BaseAffinity from "./base-affinity/base-affinity.mjs";
import CompetentAffinity from "./competent-affinity.mjs";
import StackingAffinity from "./stacking-affinity/stacking-affinity.mjs";

/**
 * Get the affinity class a type builds on.
 * @param {object} config
 * @returns {typeof BaseAffinity}
 */
function getRootAffinity(config) {
  if (config.competence) { return CompetentAffinity; }
  if (config.stacking) { return StackingAffinity; }
  return BaseAffinity;
}

/**
 * A factory function to build an affinity from a config.
 * @param {AffinityType} type
 * @returns {typeof BaseAffinity}
 */
export default function AffinityFactory(type) {
  const name = type.capitalize();
  const config = affinityConfig.types[type];
  class Affinity extends getRootAffinity(affinityConfig.types[type]) {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, `TERIOCK.AFFINITIES.${name}`];

    /** @inheritDoc */
    static get Execution() {
      return config.competence ? teriock.executions.activity.ResistanceExecution : super.Execution;
    }

    /** @inheritDoc */
    static get LABEL() {
      return `TERIOCK.TERMS.Affinities.${type}.single`;
    }

    /** @inheritDoc */
    static get TYPE() {
      return type;
    }

    /** @inheritDoc */
    get formTips() {
      const tips = super.formTips;
      if (config.tips) {
        for (const tip of config.tips) { tips.push({ level: tip.level, text: _loc(tip.text, config) }); }
      }
      return tips;
    }
  }

  return Affinity;
}
