import { preLocalize } from "../../helpers/localization.mjs";
import { colors, icons } from "../display/_module.mjs";

export const equipmentConfig = {
  powerLevel: /** @enum {Teriock.Config.SubtypeEntry} */ {
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
  unidentifiedProperties: [
    "cumbersome",
    "destroyed",
    "glowing",
    "master-crafted",
    "morganti",
    "shattered",
    "small",
  ],
  weight: { interval: 0.01 },
};

preLocalize("config.equipment.powerLevel", { keys: ["label"] });
preLocalize("config.equipment.powerLevelShort");
