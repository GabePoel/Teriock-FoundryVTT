import { preLocalize } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

/** @enum {Teriock.Config.ImpactEntry} */
export default {
  damage: {
    aliases: ["dmg"],
    deal: "TERIOCK.EFFECTS.Impacts.damage.deal",
    icon: icons.effect.damage,
    label: "TERIOCK.EFFECTS.Impacts.damage.label",
    morganti: true,
    take: "TERIOCK.EFFECTS.Impacts.damage.take",
    apply: async (actor, amt, options) => await actor?.system.takeDamage(amt, options),
    reverse: async (actor, amt) => await actor?.system.takeHealing(amt),
  },
  drain: {
    deal: "TERIOCK.EFFECTS.Impacts.drain.deal",
    icon: icons.effect.drain,
    label: "TERIOCK.EFFECTS.Impacts.drain.label",
    morganti: true,
    take: "TERIOCK.EFFECTS.Impacts.drain.take",
    apply: async (actor, amt, options) => await actor?.system.takeDrain(amt, options),
    reverse: async (actor, amt) => await actor?.system.takeRevitalizing(amt),
  },
  wither: {
    deal: "TERIOCK.EFFECTS.Impacts.wither.deal",
    icon: icons.effect.wither,
    label: "TERIOCK.EFFECTS.Impacts.wither.label",
    take: "TERIOCK.EFFECTS.Impacts.wither.take",
    apply: async (actor, amt) => await actor?.system.takeWither(amt),
    reverse: async (actor, amt) => await actor?.system.takeWither(-amt),
  },

  healing: {
    deal: "TERIOCK.EFFECTS.Impacts.heal.deal",
    icon: icons.effect.heal,
    label: "TERIOCK.EFFECTS.Impacts.heal.label",
    take: "TERIOCK.EFFECTS.Impacts.heal.take",
    apply: async (actor, amt) => await actor?.system.takeHealing(amt),
    reverse: async (actor, amt) => await actor?.system.takeDamage(amt),
  },
  revitalizing: {
    deal: "TERIOCK.EFFECTS.Impacts.revitalize.deal",
    icon: icons.effect.revitalize,
    label: "TERIOCK.EFFECTS.Impacts.revitalize.label",
    take: "TERIOCK.EFFECTS.Impacts.revitalize.take",
    apply: async (actor, amt) => await actor?.system.takeRevitalizing(amt),
    reverse: async (actor, amt) => await actor?.system.takeDrain(amt),
  },

  gainTempHp: {
    aliases: ["gth"],
    deal: "TERIOCK.EFFECTS.Impacts.gainTempHp.deal",
    icon: icons.stat.hp,
    label: "TERIOCK.EFFECTS.Impacts.gainTempHp.label",
    take: "TERIOCK.EFFECTS.Impacts.gainTempHp.take",
    apply: async (actor, amt) => await actor?.system.takeGainTempHp(amt),
    reverse: async (actor, amt) => await actor?.system.takeGainTempHp(-amt),
  },
  gainTempMp: {
    aliases: ["gtm"],
    deal: "TERIOCK.EFFECTS.Impacts.gainTempMp.deal",
    icon: icons.stat.mp,
    label: "TERIOCK.EFFECTS.Impacts.gainTempMp.label",
    take: "TERIOCK.EFFECTS.Impacts.gainTempMp.take",
    apply: async (actor, amt) => await actor?.system.takeGainTempMp(amt),
    reverse: async (actor, amt) => await actor?.system.takeGainTempMp(-amt),
  },
  setTempHp: {
    aliases: ["sth"],
    deal: "TERIOCK.EFFECTS.Impacts.setTempHp.deal",
    icon: icons.stat.hp,
    label: "TERIOCK.EFFECTS.Impacts.setTempHp.label",
    take: "TERIOCK.EFFECTS.Impacts.setTempHp.take",
    apply: async (actor, amt) => await actor?.system.takeSetTempHp(amt),
    reverse: async actor => await actor?.system.takeSetTempHp(0),
  },
  setTempMp: {
    aliases: ["stm"],
    deal: "TERIOCK.EFFECTS.Impacts.setTempMp.deal",
    icon: icons.stat.mp,
    label: "TERIOCK.EFFECTS.Impacts.setTempMp.label",
    take: "TERIOCK.EFFECTS.Impacts.setTempMp.take",
    apply: async (actor, amt) => await actor?.system.takeSetTempMp(amt),
    reverse: async actor => await actor?.system.takeSetTempMp(0),
  },

  hide: {
    deal: "TERIOCK.EFFECTS.Impacts.hide.deal",
    icon: icons.ui.hide,
    label: "TERIOCK.EFFECTS.Impacts.hide.label",
    nullable: true,
    take: "TERIOCK.EFFECTS.Impacts.hide.take",
    apply: async (actor, amt) => await actor?.system.takeHide(amt),
    reverse: async actor => await actor?.system.takeHide(null),
  },
  perceive: {
    deal: "TERIOCK.EFFECTS.Impacts.perceive.deal",
    icon: icons.ui.show,
    label: "TERIOCK.EFFECTS.Impacts.perceive.label",
    nullable: true,
    take: "TERIOCK.EFFECTS.Impacts.perceive.take",
    apply: async (actor, amt) => await actor?.system.takePerceive(amt),
    reverse: async actor => await actor?.system.takePerceive(null),
  },

  kill: {
    deal: "TERIOCK.EFFECTS.Impacts.kill.deal",
    icon: icons.effect.kill,
    label: "TERIOCK.EFFECTS.Impacts.kill.label",
    take: "TERIOCK.EFFECTS.Impacts.kill.take",
    apply: async (actor, amt) => await actor?.system.takeKill(amt),
    reverse: async actor => await actor?.toggleStatusEffect("dead", { active: false }),
  },
  pay: {
    deal: "TERIOCK.EFFECTS.Impacts.pay.deal",
    icon: icons.stat.gp,
    label: "TERIOCK.EFFECTS.Impacts.pay.label",
    take: "TERIOCK.EFFECTS.Impacts.pay.take",
    apply: async (actor, amt) => await actor?.system.takePay(amt),
    reverse: async (actor, amt) => await actor?.system.takePay(-amt),
  },
  sleep: {
    deal: "TERIOCK.EFFECTS.Impacts.sleep.deal",
    icon: icons.effect.sleep,
    label: "TERIOCK.EFFECTS.Impacts.sleep.label",
    take: "TERIOCK.EFFECTS.Impacts.sleep.take",
    apply: async (actor, amt) => await actor?.system.takeSleep(amt),
    reverse: async actor => await actor?.toggleStatusEffect("asleep", { active: false }),
  },

  other: {
    deal: "TERIOCK.EFFECTS.Impacts.other.label",
    hidden: true,
    icon: icons.ui.dice,
    label: "TERIOCK.EFFECTS.Impacts.other.label",
    take: "TERIOCK.EFFECTS.Impacts.other.label",
    apply: () => null,
    reverse: () => null,
  },
};

preLocalize("config.impact", { keys: ["label", "deal", "take"] });
