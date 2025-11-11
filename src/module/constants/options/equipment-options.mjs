import { colors } from "../display/_module.mjs";
import * as index from "../index/_module.mjs";

export const equipmentOptions = {
  powerLevel: {
    mundane: {
      name: "Mundane",
      icon: "wand",
      color: colors.brown,
    },
    enchanted: {
      name: "Enchanted",
      icon: "wand-sparkles",
      color: colors.blue,
    },
    magic: {
      name: "Magic",
      icon: "sparkles",
      color: colors.purple,
    },
    unknown: {
      name: "Unknown",
      icon: "question",
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
