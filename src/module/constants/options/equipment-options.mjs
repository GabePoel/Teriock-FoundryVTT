import { preLocalize } from "../../helpers/localization.mjs";
import { colors, icons } from "../display/_module.mjs";
import * as index from "../index/_module.mjs";
import reference from "../reference/_module.mjs";

export const equipmentOptions = {
  equipmentClasses: reference.equipmentClasses,
  equipmentType: index.equipment,
  powerLevel: {
    mundane: {
      label: "TERIOCK.TERMS.PowerLevel.mundane",
      icon: icons.powerLevel.mundane,
      color: colors.brown,
    },
    enchanted: {
      label: "TERIOCK.TERMS.PowerLevel.enchanted",
      icon: icons.powerLevel.enchanted,
      color: colors.blue,
    },
    magic: {
      label: "TERIOCK.TERMS.PowerLevel.magic",
      icon: icons.powerLevel.magic,
      color: colors.purple,
    },
    unknown: {
      label: "TERIOCK.TERMS.PowerLevel.unknown",
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
  unidentifiedProperties: [
    "cumbersome",
    "destroyed",
    "glowing",
    "master-crafted",
    "morganti",
    "shattered",
    "small",
  ],
  weaponFightingStyles: reference.weaponFightingStyles,
  weight: { interval: 0.01 },
};

preLocalize("options.equipment.powerLevel", { keys: ["label"] });
preLocalize("options.equipment.powerLevelShort");
