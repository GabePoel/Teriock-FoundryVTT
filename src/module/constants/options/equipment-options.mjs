import { colors, icons } from "../display/_module.mjs";
import * as index from "../index/_module.mjs";

export const equipmentOptions = {
  powerLevel: {
    mundane: {
      name: "Mundane",
      icon: icons.powerLevel.mundane,
      color: colors.brown,
    },
    enchanted: {
      name: "Enchanted",
      icon: icons.powerLevel.enchanted,
      color: colors.blue,
    },
    magic: {
      name: "Magic",
      icon: icons.powerLevel.magic,
      color: colors.purple,
    },
    unknown: {
      name: "Unknown",
      icon: icons.powerLevel.unknown,
      color: colors.grey,
    },
  },
  powerLevelShort: {
    mundane: "Mundane",
    enchanted: "Enchanted",
    magic: "Magic",
    unknown: "Unknown",
  },
  equipmentClasses: index.equipmentClasses,
  weaponFightingStyles: index.weaponFightingStyles,
  equipmentType: index.equipment,
  unidentifiedProperties: ["Morganti", "Master Crafted"],
};
