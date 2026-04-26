import { preLocalize } from "../../helpers/localization.mjs";
import { objectMap } from "../../helpers/utils.mjs";
import { impactConfig } from "../config/impact-config.mjs";

const triggers = {
  activity: {
    label: "TERIOCK.TRIGGERS.Activity.label",
    choices: {
      executeDeathBag: "TERIOCK.TRIGGERS.Activity.choices.deathBagPull",
      executeAbility: "TERIOCK.TRIGGERS.Activity.choices.useAbility",
      executeArmament: "TERIOCK.TRIGGERS.Activity.choices.useArmament",
      executeFeat: "TERIOCK.TRIGGERS.Activity.choices.rollFeatSave",
      executeSpell: "TERIOCK.TRIGGERS.Activity.choices.castSpell",
      executeTradecraft: "TERIOCK.TRIGGERS.Activity.choices.rollTradecraft",
      movement: "TERIOCK.TRIGGERS.Activity.choices.movement",
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
      execute: "TERIOCK.TRIGGERS.Execution.choices.execute",
      executeInput: "TERIOCK.TRIGGERS.Execution.choices.executeInput",
      preExecute: "TERIOCK.TRIGGERS.Execution.choices.preExecute",
    },
  },
  impact: {
    label: "TERIOCK.TRIGGERS.Impact.label",
    choices: objectMap(impactConfig, (c) => c.take, {
      filter: (c) => !c?.hidden,
    }),
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
