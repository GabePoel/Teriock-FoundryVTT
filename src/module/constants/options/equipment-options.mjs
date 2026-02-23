import { preLocalize } from "../../helpers/localization.mjs";
import { colors, icons } from "../display/_module.mjs";
import * as index from "../index/_module.mjs";
import reference from "../reference/_module.mjs";

export const equipmentOptions = {
  powerLevel: {
    mundane: {
      name: "TERIOCK.TERMS.PowerLevel.mundane",
      icon: icons.powerLevel.mundane,
      color: colors.brown,
    },
    enchanted: {
      name: "TERIOCK.TERMS.PowerLevel.enchanted",
      icon: icons.powerLevel.enchanted,
      color: colors.blue,
    },
    magic: {
      name: "TERIOCK.TERMS.PowerLevel.magic",
      icon: icons.powerLevel.magic,
      color: colors.purple,
    },
    unknown: {
      name: "TERIOCK.TERMS.PowerLevel.unknown",
      icon: icons.powerLevel.unknown,
      color: colors.grey,
    },
  },
  powerLevelShort: {
    mundane: "TERIOCK.TERMS.PowerLevel.mundane",
    enchanted: "TERIOCK.TERMS.PowerLevel.enchanted",
    magic: "TERIOCK.TERMS.PowerLevel.magic",
    unknown: "TERIOCK.TERMS.PowerLevel.unknown",
  },
  equipmentClasses: reference.equipmentClasses,
  weaponFightingStyles: reference.weaponFightingStyles,
  equipmentType: index.equipment,
  unidentifiedProperties: ["Morganti", "Master Crafted"],
};

preLocalize("options.equipment.powerLevel", { keys: ["name"] });
preLocalize("options.equipment.powerLevelShort");
