import { preLocalize } from "../../helpers/localization.mjs";

const triggers = {
  activity: {
    label: "TERIOCK.TRIGGERS.Activity.label",
    choices: {
      castSpell: "TERIOCK.TRIGGERS.Activity.choices.castSpell",
      deathBagPull: "TERIOCK.TRIGGERS.Activity.choices.deathBagPull",
      movement: "TERIOCK.TRIGGERS.Activity.choices.movement",
      rollFeatSave: "TERIOCK.TRIGGERS.Activity.choices.rollFeatSave",
      rollTradecraft: "TERIOCK.TRIGGERS.Activity.choices.rollTradecraft",
      useAbility: "TERIOCK.TRIGGERS.Activity.choices.useAbility",
      useArmament: "TERIOCK.TRIGGERS.Activity.choices.useArmament",
    },
  },
  attunable: {
    label: "TERIOCK.TRIGGERS.Attunable.label",
    choices: {
      attune: "TERIOCK.TRIGGERS.Attunable.choices.attune",
      deattune: "TERIOCK.TRIGGERS.Attunable.choices.deattune",
    },
  },
  combat: {
    label: "TERIOCK.TRIGGERS.Combat.label",
    choices: {
      turnStart: "TERIOCK.TRIGGERS.Combat.choices.turnStart",
      turnEnd: "TERIOCK.TRIGGERS.Combat.choices.turnEnd",
      combatStart: "TERIOCK.TRIGGERS.Combat.choices.combatStart",
      combatEnd: "TERIOCK.TRIGGERS.Combat.choices.combatEnd",
    },
  },
  consequence: {
    label: "TYPES.ActiveEffect.consequence",
    choices: {
      applyEffect: "TERIOCK.TRIGGERS.Consequence.choices.applyEffect",
      expireEffect: "TERIOCK.TRIGGERS.Consequence.choices.expireEffect",
    },
  },
  equipment: {
    label: "TYPES.Item.equipment",
    choices: {
      dampen: "TERIOCK.TRIGGERS.Equipment.choices.dampen",
      equip: "TERIOCK.TRIGGERS.Equipment.choices.equip",
      glue: "TERIOCK.TRIGGERS.Equipment.choices.glue",
      identify: "TERIOCK.TRIGGERS.Equipment.choices.identify",
      readMagic: "TERIOCK.TRIGGERS.Equipment.choices.readMagic",
      repair: "TERIOCK.TRIGGERS.Equipment.choices.repair",
      shatter: "TERIOCK.TRIGGERS.Equipment.choices.shatter",
      undampen: "TERIOCK.TRIGGERS.Equipment.choices.undampen",
      unequip: "TERIOCK.TRIGGERS.Equipment.choices.unequip",
      unglue: "TERIOCK.TRIGGERS.Equipment.choices.unglue",
    },
  },
  execution: {
    label: "TERIOCK.TRIGGERS.Execution.label",
    choices: {
      execution: "TERIOCK.TRIGGERS.Execution.choices.execution",
      preExecution: "TERIOCK.TRIGGERS.Execution.choices.preExecution",
    },
  },
  impact: {
    label: "TERIOCK.TRIGGERS.Impact.label",
    choices: {
      takeAwaken: "TERIOCK.TRIGGERS.Impact.choices.takeAwaken",
      takeDamage: "TERIOCK.TRIGGERS.Impact.choices.takeDamage",
      takeDrain: "TERIOCK.TRIGGERS.Impact.choices.takeDrain",
      takeGainTempHp: "TERIOCK.TRIGGERS.Impact.choices.takeGainTempHp",
      takeGainTempMp: "TERIOCK.TRIGGERS.Impact.choices.takeGainTempMp",
      takeHack: "TERIOCK.TRIGGERS.Impact.choices.takeHack",
      takeHeal: "TERIOCK.TRIGGERS.Impact.choices.takeHeal",
      takeKill: "TERIOCK.TRIGGERS.Impact.choices.takeKill",
      takeNormalHeal: "TERIOCK.TRIGGERS.Impact.choices.takeNormalHeal",
      takeNormalRevitalize:
        "TERIOCK.TRIGGERS.Impact.choices.takeNormalRevitalize",
      takePay: "TERIOCK.TRIGGERS.Impact.choices.takePay",
      takeRevitalize: "TERIOCK.TRIGGERS.Impact.choices.takeRevitalize",
      takeRevive: "TERIOCK.TRIGGERS.Impact.choices.takeRevive",
      takeSetTempHp: "TERIOCK.TRIGGERS.Impact.choices.takeSetTempHp",
      takeSetTempMp: "TERIOCK.TRIGGERS.Impact.choices.takeSetTempMp",
      takeSleep: "TERIOCK.TRIGGERS.Impact.choices.takeSleep",
      takeUnhack: "TERIOCK.TRIGGERS.Impact.choices.takeUnhack",
      takeWither: "TERIOCK.TRIGGERS.Impact.choices.takeWither",
    },
  },
  mount: {
    label: "TYPES.Item.mount",
    choices: {
      mount: "TERIOCK.SYSTEMS.Mount.MENU.mount",
      unmount: "TERIOCK.SYSTEMS.Mount.MENU.unmount",
    },
  },
  protection: {
    label: "TERIOCK.TRIGGERS.Protection.label",
    choices: {
      hexproof: "TERIOCK.ROLLS.Hexproof.button",
      hexseal: "TERIOCK.ROLLS.Hexseal.button",
      immune: "TERIOCK.ROLLS.Immune.button",
      resist: "TERIOCK.ROLLS.Resist.button",
    },
  },
  time: {
    label: "TERIOCK.TRIGGERS.Time.label",
    choices: {
      dawn: "TERIOCK.TRIGGERS.Time.choices.dawn",
      dusk: "TERIOCK.TRIGGERS.Time.choices.dusk",
      longRest: "TERIOCK.TRIGGERS.Time.choices.longRest",
      shortRest: "TERIOCK.TRIGGERS.Time.choices.shortRest",
    },
  },
};

preLocalize("system.triggers", { keys: ["label"] });
preLocalize("system.triggers.activity.choices");
preLocalize("system.triggers.attunable.choices");
preLocalize("system.triggers.combat.choices");
preLocalize("system.triggers.consequence.choices");
preLocalize("system.triggers.equipment.choices");
preLocalize("system.triggers.execution.choices");
preLocalize("system.triggers.impact.choices");
preLocalize("system.triggers.mount.choices");
preLocalize("system.triggers.protection.choices");
preLocalize("system.triggers.time.choices");

export default triggers;
