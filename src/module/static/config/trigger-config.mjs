import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { objectMap } from "../../utils/_module.mjs";
import commandConfig from "./command-config.mjs";

const triggerConfig = {
  activity: {
    alwaysAvailable: true,
    choices: {
      executeAbility: "TERIOCK.TRIGGERS.Activity.choices.useAbility",
      executeArmament: "TERIOCK.TRIGGERS.Activity.choices.useArmament",
      executeDeathBag: "TERIOCK.TRIGGERS.Activity.choices.deathBagPull",
      executeElderSorcery: "TERIOCK.TRIGGERS.Activity.choices.createElderSorcery",
      executeFall: "TERIOCK.TRIGGERS.Activity.choices.fall",
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
    granted: true,
    label: "TERIOCK.TRIGGERS.Attunable.label",
    self: true,
  },
  combat: {
    alwaysAvailable: true,
    choices: {
      combatEnd: "TERIOCK.TRIGGERS.Combat.choices.combatEnd",
      combatStart: "TERIOCK.TRIGGERS.Combat.choices.combatStart",
      turnEnd: "TERIOCK.TRIGGERS.Combat.choices.turnEnd",
      turnStart: "TERIOCK.TRIGGERS.Combat.choices.turnStart",
    },
    label: "TERIOCK.TRIGGERS.Combat.label",
  },
  command: {
    alwaysAvailable: true,
    choices: objectMap(commandConfig, c => c.numeric?.take, { filter: c => c.numeric && !c.numeric.hidden }),
    label: "TERIOCK.TRIGGERS.Command.label",
  },
  consequence: {
    alwaysAvailable: true,
    choices: {
      applyEffect: "TERIOCK.TRIGGERS.Consequence.choices.applyEffect",
      expireEffect: "TERIOCK.TRIGGERS.Consequence.choices.expireEffect",
    },
    label: "TYPES.ActiveEffect.consequence",
    self: true,
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
    granted: true,
    label: "TYPES.Item.equipment",
    self: true,
  },
  mount: {
    choices: { mount: "TERIOCK.SYSTEMS.Mount.MENU.mount", unmount: "TERIOCK.SYSTEMS.Mount.MENU.unmount" },
    label: "TYPES.Item.mount",
    self: true,
  },
  protection: {
    alwaysAvailable: true,
    choices: {
      hexproof: "TERIOCK.ROLLS.Hexproof.button",
      hexseal: "TERIOCK.ROLLS.Hexseal.button",
      immune: "TERIOCK.ROLLS.Immune.button",
      resist: "TERIOCK.ROLLS.Resist.button",
    },
    label: "TERIOCK.TRIGGERS.Protection.label",
  },
  time: {
    alwaysAvailable: true,
    choices: {
      dawn: "TERIOCK.TRIGGERS.Time.choices.dawn",
      dusk: "TERIOCK.TRIGGERS.Time.choices.dusk",
      longRest: "TERIOCK.TRIGGERS.Time.choices.longRest",
      sessionEnd: "TERIOCK.TRIGGERS.Time.choices.sessionEnd",
      sessionStart: "TERIOCK.TRIGGERS.Time.choices.sessionStart",
      shortRest: "TERIOCK.TRIGGERS.Time.choices.shortRest",
    },
    label: "TERIOCK.TRIGGERS.Time.label",
  },
};

preLocalizeConfig("CONFIG.trigger", { keys: ["label"] });
preLocalizeConfig("CONFIG.trigger.activity.choices");
preLocalizeConfig("CONFIG.trigger.attunable.choices");
preLocalizeConfig("CONFIG.trigger.combat.choices");
preLocalizeConfig("CONFIG.trigger.consequence.choices");
preLocalizeConfig("CONFIG.trigger.equipment.choices");
preLocalizeConfig("CONFIG.trigger.command.choices");
preLocalizeConfig("CONFIG.trigger.mount.choices");
preLocalizeConfig("CONFIG.trigger.protection.choices");
preLocalizeConfig("CONFIG.trigger.time.choices");

export default triggerConfig;
