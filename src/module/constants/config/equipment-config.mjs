import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { colors, icons } from "../display/_module.mjs";
import systemConfig from "./system-config.mjs";

export default {
  kind: /** @enum {Teriock.Config.KindEntry} */ {
    enchanted: {
      color: colors.palette.blue,
      icon: icons.manifest.powerLevel.enchanted,
      label: "TERIOCK.TERMS.EquipmentKind.enchanted",
    },
    magic: {
      color: colors.palette.purple,
      icon: icons.manifest.powerLevel.magic,
      label: "TERIOCK.TERMS.EquipmentKind.magic",
    },
    mundane: {
      color: colors.palette.brown,
      icon: icons.manifest.powerLevel.mundane,
      label: "TERIOCK.TERMS.EquipmentKind.mundane",
    },
    ...systemConfig.childKinds,
    unknown: { ...systemConfig.childKinds.unknown, label: "TERIOCK.TERMS.EquipmentKind.unknown" },
  },
  unidentifiedProperties: ["cumbersome", "destroyed", "glowing", "master-crafted", "morganti", "shattered", "small"],
};

preLocalizeConfig("config.equipment.kind", { keys: ["label"] });
