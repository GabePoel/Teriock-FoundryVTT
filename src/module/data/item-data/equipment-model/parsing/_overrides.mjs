/**
 * Equipment type overrides for specific equipment types.
 * Provides default values for damage, damage types, and consumable properties.
 * @type {object}
 * @private
 */
const equipmentMap = {
  Torch: {
    "damage.base.raw": "1",
  },
  Stinger: {
    "damage.base.raw": "1d4",
    "damage.types": ["toxic"],
  },
  Boulder: {
    consumable: true,
  },
};

/**
 * Applies equipment type-specific overrides to equipment parameters.
 * Checks if the equipment type has predefined overrides and applies them.
 * @param {TeriockEquipmentModel} equipmentData - The equipment data to apply overrides to.
 * @param {Partial<TeriockEquipmentModel>} parameters - The parameters to override.
 * @returns {Partial<TeriockEquipmentModel>} The parameters with overrides applied.
 * @private
 */
export function _override(equipmentData, parameters) {
  if (equipmentMap[equipmentData.equipmentType]) {
    const map = equipmentMap[equipmentData.equipmentType];
    for (const [key, value] of Object.entries(map)) {
      foundry.utils.setProperty(parameters, key, value);
    }
  }
  return parameters;
}
