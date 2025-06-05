const equipmentMap = {
  'Hand': {
    damage: '1d@hand',
  },
  'Foot': {
    damage: '1d@foot',
  },
  'Mouth': {
    damage: '1d@mouth',
  },
  'Buckler Shield': {
    damage: '1d@bshield',
  },
  'Large Shield': {
    damage: '1d@lshield',
  },
  'Tower Shield': {
    damage: '1d@tshield',
  },
  'Torch': {
    damage: '1',
    damageTypes: ['Fire'],
  }
}

export default function equipmentOverrides(equipment, parameters) {
  if (equipmentMap[equipment.system.equipmentType]) {
    const map = equipmentMap[equipment.system.equipmentType];
    for (const [key, value] of Object.entries(map)) {
      if (parameters[key] !== undefined) {
        parameters[key] = value;
      }
    }
  }
  return parameters;
}