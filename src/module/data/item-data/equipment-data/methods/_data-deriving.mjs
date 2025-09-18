/**
 * Prepares derived data for equipment by calculating the derived tier value.
 * Uses smart evaluation to compute the tier based on the raw tier formula and parent context.
 * @param {TeriockEquipmentModel} equipmentData - The equipment data system to prepare derived data for.
 * @returns {void}
 * @private
 */
export function _prepareDerivedData(equipmentData) {
  if (equipmentData.consumable && equipmentData.quantity === 0) {
    equipmentData.equipped = false;
  }
  if (equipmentData.sb && equipmentData.sb.length > 0) {
    equipmentData.specialRules = TERIOCK.content.weaponFightingStyles[equipmentData.sb];
  }
}
