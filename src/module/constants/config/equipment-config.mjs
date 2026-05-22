import { preLocalize } from "../../helpers/localization.mjs";
import { colors, icons } from "../display/_module.mjs";

export const equipmentConfig = {
  powerLevel: /** @enum {Teriock.Config.SubtypeEntry} */ {
    enchanted: { color: colors.blue, icon: icons.powerLevel.enchanted, label: "TERIOCK.TERMS.PowerLevel.enchanted" },
    magic: { color: colors.purple, icon: icons.powerLevel.magic, label: "TERIOCK.TERMS.PowerLevel.magic" },
    mundane: { color: colors.brown, icon: icons.powerLevel.mundane, label: "TERIOCK.TERMS.PowerLevel.mundane" },
    unknown: { color: colors.grey, icon: icons.powerLevel.unknown, label: "TERIOCK.TERMS.PowerLevel.unknown" },
  },
  unidentifiedProperties: ["cumbersome", "destroyed", "glowing", "master-crafted", "morganti", "shattered", "small"],
  weight: { interval: 0.01 },
};

preLocalize("config.equipment.powerLevel", { keys: ["label"] });
preLocalize("config.equipment.powerLevelShort");
