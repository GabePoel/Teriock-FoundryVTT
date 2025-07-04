/**
 * Equipment type overrides for specific equipment types.
 * Provides default values for damage, damage types, and consumable properties.
 * @type {object}
 * @private
 */
const equipmentMap = {
  Hand: {
    damage: "1d@hand",
  },
  Foot: {
    damage: "1d@foot",
  },
  Mouth: {
    damage: "1d@mouth",
  },
  "Buckler Shield": {
    damage: "1d@bshield",
  },
  "Large Shield": {
    damage: "1d@lshield",
  },
  "Tower Shield": {
    damage: "1d@tshield",
  },
  Torch: {
    damage: "1",
    damageTypes: ["Fire"],
  },
  Boulder: {
    consumable: true,
  },
};

/**
 * Applies equipment type-specific overrides to equipment parameters.
 * Checks if the equipment type has predefined overrides and applies them.
 * @param {TeriockEquipmentData} equipmentData - The equipment data to apply overrides to.
 * @param {Partial<TeriockEquipmentData>} parameters - The parameters to override.
 * @returns {Partial<TeriockEquipmentData>} The parameters with overrides applied.
 * @private
 */
export function _override(equipmentData, parameters) {
  if (equipmentMap[equipmentData.equipmentType]) {
    const map = equipmentMap[equipmentData.equipmentType];
    for (const [key, value] of Object.entries(map)) {
      if (parameters[key] !== undefined) {
        parameters[key] = value;
      }
    }
  }
  return parameters;
}
