import { smartEvaluateSync } from "../../../../helpers/utils.mjs";

/**
 * Prepares derived data for equipment by calculating the derived tier value.
 * Uses smart evaluation to compute the tier based on the raw tier formula and parent context.
 * @param {TeriockEquipmentData} system - The equipment data system to prepare derived data for.
 * @returns {void}
 * @private
 */
export function _prepareDerivedData(system) {
  system.tier.derived = Math.max(0, smartEvaluateSync(system.tier.raw, system.parent));
}
