import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { objectMap } from "../../helpers/utils.mjs";
import impactConfig from "./impact-config.mjs";

const triggerConfig = {
  activity: {
    choices: {
      executeAbility: "TERIOCK.TRIGGERS.Activity.choices.useAbility",
      executeArmament: "TERIOCK.TRIGGERS.Activity.choices.useArmament",
      executeDeathBag: "TERIOCK.TRIGGERS.Activity.choices.deathBagPull",
      executeFeat: "TERIOCK.TRIGGERS.Activity.choices.rollFeatSave",
      executeSpell: "TERIOCK.TRIGGERS.Activity.choices.castSpell",
      executeTradecraft: "TERIOCK.TRIGGERS.Activity.choices.rollTradecraft",
      movement: "TERIOCK.TRIGGERS.Activity.choices.movement",
    },
    label: "TERIOCK.TRIGGERS.Activity.label",
  },
  attunable: {
    choices: {
      attune: "TERIOCK.TRIGGERS.Attunable.choices.attune",
      deattune: "TERIOCK.TRIGGERS.Attunable.choices.deattune",
    },
    label: "TERIOCK.TRIGGERS.Attunable.label",
  },
  combat: {
    choices: {
      combatEnd: "TERIOCK.TRIGGERS.Combat.choices.combatEnd",
      combatStart: "TERIOCK.TRIGGERS.Combat.choices.combatStart",
      turnEnd: "TERIOCK.TRIGGERS.Combat.choices.turnEnd",
      turnStart: "TERIOCK.TRIGGERS.Combat.choices.turnStart",
    },
    label: "TERIOCK.TRIGGERS.Combat.label",
  },
  consequence: {
    choices: {
      applyEffect: "TERIOCK.TRIGGERS.Consequence.choices.applyEffect",
      expireEffect: "TERIOCK.TRIGGERS.Consequence.choices.expireEffect",
    },
    label: "TYPES.ActiveEffect.consequence",
  },
  equipment: {
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
    label: "TYPES.Item.equipment",
  },
  execution: {
    choices: {
      execute: "TERIOCK.TRIGGERS.Execution.choices.execute",
      executeInput: "TERIOCK.TRIGGERS.Execution.choices.executeInput",
      preExecute: "TERIOCK.TRIGGERS.Execution.choices.preExecute",
    },
    label: "TERIOCK.TRIGGERS.Execution.label",
  },
  impact: {
    choices: objectMap(impactConfig, c => c.take, { filter: c => !c?.hidden }),
    label: "TERIOCK.TRIGGERS.Impact.label",
  },
  mount: {
    choices: { mount: "TERIOCK.SYSTEMS.Mount.MENU.mount", unmount: "TERIOCK.SYSTEMS.Mount.MENU.unmount" },
    label: "TYPES.Item.mount",
  },
  protection: {
    choices: {
      hexproof: "TERIOCK.ROLLS.Hexproof.button",
      hexseal: "TERIOCK.ROLLS.Hexseal.button",
      immune: "TERIOCK.ROLLS.Immune.button",
      resist: "TERIOCK.ROLLS.Resist.button",
    },
    label: "TERIOCK.TRIGGERS.Protection.label",
  },
  time: {
    choices: {
      dawn: "TERIOCK.TRIGGERS.Time.choices.dawn",
      dusk: "TERIOCK.TRIGGERS.Time.choices.dusk",
      longRest: "TERIOCK.TRIGGERS.Time.choices.longRest",
      shortRest: "TERIOCK.TRIGGERS.Time.choices.shortRest",
    },
    label: "TERIOCK.TRIGGERS.Time.label",
  },
  update: {
    choices: {
      updateActor: "TERIOCK.TRIGGERS.Update.choices.updateActor",
      updateDocument: "TERIOCK.TRIGGERS.Update.choices.updateDocument",
    },
    label: "TERIOCK.TRIGGERS.Update.label",
  },
};

preLocalizeConfig("config.trigger", { keys: ["label"] });
preLocalizeConfig("config.trigger.activity.choices");
preLocalizeConfig("config.trigger.attunable.choices");
preLocalizeConfig("config.trigger.combat.choices");
preLocalizeConfig("config.trigger.consequence.choices");
preLocalizeConfig("config.trigger.equipment.choices");
preLocalizeConfig("config.trigger.execution.choices");
preLocalizeConfig("config.trigger.impact.choices");
preLocalizeConfig("config.trigger.mount.choices");
preLocalizeConfig("config.trigger.protection.choices");
preLocalizeConfig("config.trigger.time.choices");
preLocalizeConfig("config.trigger.update.choices");

export default triggerConfig;
