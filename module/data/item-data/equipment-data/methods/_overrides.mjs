/** @import TeriockEquipmentData from "../equipment-data.mjs"; */
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
 *
 * @param {TeriockEquipmentData} equipmentData
 * @param {Partial<TeriockEquipmentData>} parameters
 * @returns {Partial<TeriockEquipmentData>}
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
