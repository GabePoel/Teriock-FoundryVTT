import { preLocalizeObject } from "../../helpers/localization.mjs";

/** Filled in with document data once identifiers are initialized. */
const triggerContext = {
  "trigger.amount": "TERIOCK.ROLL_CONTEXT.Trigger.amount",
  "trigger.mode.exact": "TERIOCK.ROLL_CONTEXT.Trigger.modeExact",
  "trigger.mode.greedy": "TERIOCK.ROLL_CONTEXT.Trigger.modeGreedy",

  "this.ability": "TERIOCK.ROLL_CONTEXT.Relation.ability",
  "this.actor": "TERIOCK.ROLL_CONTEXT.Relation.actor",
  "this.armament": "TERIOCK.ROLL_CONTEXT.Relation.armament",
  "this.effect": "TERIOCK.ROLL_CONTEXT.Relation.effect",
  "this.exec": "TERIOCK.ROLL_CONTEXT.Relation.exec",
  "this.item": "TERIOCK.ROLL_CONTEXT.Relation.item",
};

export default triggerContext;

preLocalizeObject("ROLL_CONTEXT.trigger");
Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.attribute).forEach(([k, v]) => {
    triggerContext[`trigger.feat.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Trigger.feat", { name: v.abbreviation });
  });
  Object.entries(TERIOCK.CONFIG.tradecraft.tradecrafts).forEach(([k, v]) => {
    triggerContext[`trigger.tradecraft.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Trigger.tradecraft", { name: v.label });
  });
  Object.entries(TERIOCK.CONFIG.hack).forEach(([k, v]) => {
    triggerContext[`trigger.hack.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Trigger.hack", { part: v.part });
  });
});
