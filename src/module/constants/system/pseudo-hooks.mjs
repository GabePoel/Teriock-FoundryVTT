import { preLocalize } from "../../helpers/localization.mjs";
import { timeOptions } from "../options/time-options.mjs";

const childPseudoHooks = {
  execution: "TERIOCK.PSEUDO_HOOKS.execution",
  preExecution: "TERIOCK.PSEUDO_HOOKS.preExecution",
};
preLocalize("system.pseudoHooks.child", { sort: true });

const actorPseudoHooks = {
  ...timeOptions.triggers,
  deathBagPull: "TERIOCK.PSEUDO_HOOKS.deathBagPull",
  movement: "TERIOCK.PSEUDO_HOOKS.movement",
  rollFeatSave: "TERIOCK.PSEUDO_HOOKS.rollFeatSave",
  rollImmunity: "TERIOCK.PSEUDO_HOOKS.rollImmunity",
  rollResistance: "TERIOCK.PSEUDO_HOOKS.rollResistance",
  rollTradecraft: "TERIOCK.PSEUDO_HOOKS.rollTradecraft",
  takeAwaken: "TERIOCK.PSEUDO_HOOKS.takeAwaken",
  takeDamage: "TERIOCK.PSEUDO_HOOKS.takeDamage",
  takeDrain: "TERIOCK.PSEUDO_HOOKS.takeDrain",
  takeGainTempHp: "TERIOCK.PSEUDO_HOOKS.takeGainTempHp",
  takeGainTempMp: "TERIOCK.PSEUDO_HOOKS.takeGainTempMp",
  takeHack: "TERIOCK.PSEUDO_HOOKS.takeHack",
  takeHeal: "TERIOCK.PSEUDO_HOOKS.takeHeal",
  takeKill: "TERIOCK.PSEUDO_HOOKS.takeKill",
  takeNormalHeal: "TERIOCK.PSEUDO_HOOKS.takeNormalHeal",
  takeNormalRevitalize: "TERIOCK.PSEUDO_HOOKS.takeNormalRevitalize",
  takePay: "TERIOCK.PSEUDO_HOOKS.takePay",
  takeRevitalize: "TERIOCK.PSEUDO_HOOKS.takeRevitalize",
  takeRevive: "TERIOCK.PSEUDO_HOOKS.takeRevive",
  takeSetTempHp: "TERIOCK.PSEUDO_HOOKS.takeSetTempHp",
  takeSetTempMp: "TERIOCK.PSEUDO_HOOKS.takeSetTempMp",
  takeSleep: "TERIOCK.PSEUDO_HOOKS.takeSleep",
  takeUnhack: "TERIOCK.PSEUDO_HOOKS.takeUnhack",
  takeWither: "TERIOCK.PSEUDO_HOOKS.takeWither",
  turnStart: "TERIOCK.TERMS.Triggers.turnStart",
  turnEnd: "TERIOCK.TERMS.Triggers.turnEnd",
  combatStart: "TERIOCK.TERMS.Triggers.combatStart",
  combatEnd: "TERIOCK.TERMS.Triggers.combatEnd",
};
preLocalize("system.pseudoHooks.actor", { sort: true });

const abilityPseudoHooks = {
  ...actorPseudoHooks,
  ...childPseudoHooks,
  //documentChat: "TERIOCK.PSEUDO_HOOKS.documentChat",
  //documentDuplicate: "TERIOCK.PSEUDO_HOOKS.documentDuplicate",
  effectApplication: "TERIOCK.PSEUDO_HOOKS.effectApplication",
  effectExpiration: "TERIOCK.PSEUDO_HOOKS.effectExpiration",
  postUpdate: "TERIOCK.PSEUDO_HOOKS.postUpdate",
  //useAbility: "TERIOCK.PSEUDO_HOOKS.useAbility",
  //useArmament: "TERIOCK.PSEUDO_HOOKS.useArmament",
};
preLocalize("system.pseudoHooks.ability", { sort: true });

const propertyPseudoHooks = {
  equipmentAttune: "TERIOCK.PSEUDO_HOOKS.equipmentAttune",
  equipmentDampen: "TERIOCK.PSEUDO_HOOKS.equipmentDampen",
  equipmentDeattune: "TERIOCK.PSEUDO_HOOKS.equipmentDeattune",
  equipmentEquip: "TERIOCK.PSEUDO_HOOKS.equipmentEquip",
  equipmentGlue: "TERIOCK.PSEUDO_HOOKS.equipmentGlue",
  equipmentIdentify: "TERIOCK.PSEUDO_HOOKS.equipmentIdentify",
  equipmentReadMagic: "TERIOCK.PSEUDO_HOOKS.equipmentReadMagic",
  equipmentRepair: "TERIOCK.PSEUDO_HOOKS.equipmentRepair",
  equipmentShatter: "TERIOCK.PSEUDO_HOOKS.equipmentShatter",
  equipmentUndampen: "TERIOCK.PSEUDO_HOOKS.equipmentUndampen",
  equipmentUnequip: "TERIOCK.PSEUDO_HOOKS.equipmentUnequip",
  equipmentUnglue: "TERIOCK.PSEUDO_HOOKS.equipmentUnglue",
  //equipmentUnidentify: "TERIOCK.PSEUDO_HOOKS.equipmentUnidentify",
  use: "TERIOCK.PSEUDO_HOOKS.use",
};
preLocalize("system.pseudoHooks.property", { sort: true });

const unsortedPseudoHooks = foundry.utils.mergeObject(
  abilityPseudoHooks,
  propertyPseudoHooks,
  childPseudoHooks,
);
preLocalize("system.pseudoHooks.all", { sort: true });

const pseudoHooks = {
  actor: actorPseudoHooks,
  ability: abilityPseudoHooks,
  property: propertyPseudoHooks,
  child: childPseudoHooks,
  all: unsortedPseudoHooks,
};
export default pseudoHooks;
