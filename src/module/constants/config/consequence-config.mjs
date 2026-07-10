import { preLocalizeConfig } from "../../helpers/localization.mjs";

export default {
  common: {
    attune: "TERIOCK.SYSTEMS.Attunable.MENU.attune",
    awaken: "TERIOCK.EFFECTS.Common.awaken",
    bag: "TERIOCK.EFFECTS.Common.bag",
    dampen: "TERIOCK.SYSTEMS.Equipment.MENU.dampen",
    deattune: "TERIOCK.SYSTEMS.Attunable.MENU.deattune",
    destroy: "TERIOCK.SYSTEMS.Equipment.MENU.destroy",
    glue: "TERIOCK.SYSTEMS.Equipment.MENU.glue",
    identify: "TERIOCK.SYSTEMS.Equipment.MENU.identify",
    longRest: "TERIOCK.SHEETS.Actor.ACTIONS.TakeLongRest.label",
    readMagic: "TERIOCK.SYSTEMS.Equipment.MENU.readMagic",
    reforge: "TERIOCK.SYSTEMS.Equipment.MENU.reforge",
    repair: "TERIOCK.SYSTEMS.Equipment.MENU.repair",
    revive: "TERIOCK.EFFECTS.Common.revive",
    shatter: "TERIOCK.SYSTEMS.Equipment.MENU.shatter",
    shortRest: "TERIOCK.SHEETS.Actor.ACTIONS.TakeShortRest.label",
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
    manifest: { use: "TERIOCK.SYSTEMS.Ability.FIELDS.results.use.label" },
  },
};

preLocalizeConfig("config.consequence.interaction.attack");
preLocalizeConfig("config.consequence.interaction.feat");
preLocalizeConfig("config.consequence.interaction.manifest");
preLocalizeConfig("config.consequence.interaction.block");
preLocalizeConfig("config.consequence.common");
