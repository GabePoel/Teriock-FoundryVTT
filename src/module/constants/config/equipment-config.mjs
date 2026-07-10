import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { colors, icons } from "../display/_module.mjs";

export default {
  powerLevel: /** @enum {Teriock.Config.SubtypeEntry} */ {
    enchanted: {
      color: colors.palette.blue,
      icon: icons.powerLevel.enchanted,
      label: "TERIOCK.TERMS.PowerLevel.enchanted",
    },
    magic: { color: colors.palette.purple, icon: icons.powerLevel.magic, label: "TERIOCK.TERMS.PowerLevel.magic" },
    mundane: { color: colors.palette.brown, icon: icons.powerLevel.mundane, label: "TERIOCK.TERMS.PowerLevel.mundane" },
    unknown: { color: colors.palette.grey, icon: icons.powerLevel.unknown, label: "TERIOCK.TERMS.PowerLevel.unknown" },
  },
  unidentifiedProperties: ["cumbersome", "destroyed", "glowing", "master-crafted", "morganti", "shattered", "small"],
  weight: { interval: 0.01 },
};

preLocalizeConfig("config.equipment.powerLevel", { keys: ["label"] });
preLocalizeConfig("config.equipment.powerLevelShort");
