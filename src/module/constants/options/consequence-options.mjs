import { preLocalize } from "../../helpers/localization.mjs";

export const consequenceOptions = {
  hacks: {
    arm: "TERIOCK.STATUSES.Hacks.armHack",
    leg: "TERIOCK.STATUSES.Hacks.legHack",
    body: "TERIOCK.STATUSES.Hacks.bodyHack",
    eye: "TERIOCK.STATUSES.Hacks.eyeHack",
    ear: "TERIOCK.STATUSES.Hacks.earHack",
    mouth: "TERIOCK.STATUSES.Hacks.mouthHack",
    nose: "TERIOCK.STATUSES.Hacks.noseHack",
  },
  interaction: {
    attack: {
      hit: "TERIOCK.SYSTEMS.Ability.FIELDS.results.hit.label",
      miss: "TERIOCK.SYSTEMS.Ability.FIELDS.results.miss.label",
    },
    feat: {
      fail: "TERIOCK.SYSTEMS.Ability.FIELDS.results.fail.label",
      save: "TERIOCK.SYSTEMS.Ability.FIELDS.results.save.label",
    },
    manifest: {
      use: "TERIOCK.SYSTEMS.Ability.FIELDS.results.use.label",
    },
    block: {
      save: "TERIOCK.SYSTEMS.Ability.FIELDS.results.save.label",
      fail: "TERIOCK.SYSTEMS.Ability.FIELDS.results.fail.label",
    },
  },
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
};

preLocalize("options.consequence.hacks");
preLocalize("options.consequence.interaction.attack");
preLocalize("options.consequence.interaction.feat");
preLocalize("options.consequence.interaction.manifest");
preLocalize("options.consequence.interaction.block");
preLocalize("options.consequence.common");
