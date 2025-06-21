/** @import TeriockEquipmentData from "../equipment-data.mjs" */
import { smartEvaluateSync } from "../../../../helpers/utils.mjs";

/**
 * @param {TeriockEquipmentData} system
 * @returns {void}
 * @private
 */
export function _prepareDerivedData(system) {
  system.tier.derived = Math.max(0, smartEvaluateSync(system.tier.raw, system.parent));
}