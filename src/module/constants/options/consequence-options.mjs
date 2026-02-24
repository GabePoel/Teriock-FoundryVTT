import { preLocalize } from "../../helpers/localization.mjs";

export const consequenceOptions = {
  rolls: {
    damage: "TERIOCK.EFFECTS.RollableEffects.damage.deal",
    drain: "TERIOCK.EFFECTS.RollableEffects.drain.deal",
    wither: "TERIOCK.EFFECTS.RollableEffects.damage.deal",
    healing: "TERIOCK.EFFECTS.RollableEffects.heal.deal",
    revitalizing: "TERIOCK.EFFECTS.RollableEffects.revitalize.deal",
    setTempHp: "TERIOCK.EFFECTS.RollableEffects.setTempHp.deal",
    setTempMp: "TERIOCK.EFFECTS.RollableEffects.setTempMp.deal",
    gainTempHp: "TERIOCK.EFFECTS.RollableEffects.gainTempHp.deal",
    gainTempMp: "TERIOCK.EFFECTS.RollableEffects.gainTempMp.deal",
    sleep: "TERIOCK.EFFECTS.RollableEffects.sleep.deal",
    kill: "TERIOCK.EFFECTS.RollableEffects.kill.deal",
    pay: "TERIOCK.EFFECTS.RollableEffects.pay.deal",
    other: "TERIOCK.EFFECTS.RollableEffects.other.deal",
  },
  takes: {
    damage: "TERIOCK.EFFECTS.RollableEffects.damage.take",
    drain: "TERIOCK.EFFECTS.RollableEffects.drain.take",
    wither: "TERIOCK.EFFECTS.RollableEffects.damage.take",
    healing: "TERIOCK.EFFECTS.RollableEffects.heal.take",
    revitalizing: "TERIOCK.EFFECTS.RollableEffects.revitalize.take",
    setTempHp: "TERIOCK.EFFECTS.RollableEffects.setTempHp.take",
    setTempMp: "TERIOCK.EFFECTS.RollableEffects.setTempMp.take",
    gainTempHp: "TERIOCK.EFFECTS.RollableEffects.gainTempHp.take",
    gainTempMp: "TERIOCK.EFFECTS.RollableEffects.gainTempMp.take",
    sleep: "TERIOCK.EFFECTS.RollableEffects.sleep.take",
    kill: "TERIOCK.EFFECTS.RollableEffects.kill.take",
    pay: "TERIOCK.EFFECTS.RollableEffects.pay.take",
    other: "TERIOCK.EFFECTS.RollableEffects.other.take",
  },
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
    standardDamage: "TERIOCK.EFFECTS.Common.standardDamage",
    bag: "TERIOCK.EFFECTS.Common.bag",
    revive: "TERIOCK.EFFECTS.Common.revive",
    awaken: "TERIOCK.EFFECTS.Common.awaken",
  },
};

preLocalize("options.consequence.rolls");
preLocalize("options.consequence.takes");
preLocalize("options.consequence.hacks");
preLocalize("options.consequence.interaction.attack");
preLocalize("options.consequence.interaction.feat");
preLocalize("options.consequence.interaction.manifest");
preLocalize("options.consequence.interaction.block");
preLocalize("options.consequence.common");
