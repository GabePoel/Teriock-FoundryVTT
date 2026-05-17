import { preLocalize } from "../../helpers/localization.mjs";

export const consequenceConfig = {
  common: {
    attune: "TERIOCK.SYSTEMS.Attunable.MENU.attune",
    awaken: "TERIOCK.EFFECTS.Common.awaken",
    bag: "TERIOCK.EFFECTS.Common.bag",
    dampen: "TERIOCK.SYSTEMS.Equipment.MENU.dampen",
    deattune: "TERIOCK.SYSTEMS.Attunable.MENU.deattune",
    destroy: "TERIOCK.SYSTEMS.Equipment.MENU.destroy",
    glue: "TERIOCK.SYSTEMS.Equipment.MENU.glue",
    identify: "TERIOCK.SYSTEMS.Equipment.MENU.identify",
    readMagic: "TERIOCK.SYSTEMS.Equipment.MENU.readMagic",
    reforge: "TERIOCK.SYSTEMS.Equipment.MENU.reforge",
    repair: "TERIOCK.SYSTEMS.Equipment.MENU.repair",
    revive: "TERIOCK.EFFECTS.Common.revive",
    shatter: "TERIOCK.SYSTEMS.Equipment.MENU.shatter",
    standardDamage: "TERIOCK.EFFECTS.Common.standardDamage",
    undampen: "TERIOCK.SYSTEMS.Equipment.MENU.undampen",
    unglue: "TERIOCK.SYSTEMS.Equipment.MENU.unglue",
  },
  interaction: {
    attack: {
      hit: "TERIOCK.SYSTEMS.Ability.FIELDS.results.hit.label",
      miss: "TERIOCK.SYSTEMS.Ability.FIELDS.results.miss.label",
    },
    block: {
      fail: "TERIOCK.SYSTEMS.Ability.FIELDS.results.fail.label",
      save: "TERIOCK.SYSTEMS.Ability.FIELDS.results.save.label",
    },
    feat: {
      fail: "TERIOCK.SYSTEMS.Ability.FIELDS.results.fail.label",
      save: "TERIOCK.SYSTEMS.Ability.FIELDS.results.save.label",
    },
    manifest: {
      use: "TERIOCK.SYSTEMS.Ability.FIELDS.results.use.label",
    },
  },
};

preLocalize("config.consequence.interaction.attack");
preLocalize("config.consequence.interaction.feat");
preLocalize("config.consequence.interaction.manifest");
preLocalize("config.consequence.interaction.block");
preLocalize("config.consequence.common");
