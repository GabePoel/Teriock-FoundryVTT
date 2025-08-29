import { smartEvaluateSync } from "../../../../helpers/utils.mjs";

/**
 * Prepares derived data for equipment by calculating the derived tier value.
 * Uses smart evaluation to compute the tier based on the raw tier formula and parent context.
 *
 * @param {TeriockEquipmentData} equipmentData - The equipment data system to prepare derived data for.
 * @returns {void}
 * @private
 */
export function _prepareDerivedData(equipmentData) {
  equipmentData.tier.derived = Math.max(
    0,
    smartEvaluateSync(equipmentData.tier.raw, equipmentData.parent),
  );
  if (equipmentData.consumable && equipmentData.quantity === 0) {
    equipmentData.equipped = false;
  }
}
