import { preLocalizeConfig } from "../../helpers/localization.mjs";

/** Filled in with document data once identifiers are initialized. */
const triggerContext = {
  amount: "TERIOCK.ROLL_CONTEXT.Trigger.amount",
  "mode.exact": "TERIOCK.ROLL_CONTEXT.Trigger.modeExact",
  "mode.greedy": "TERIOCK.ROLL_CONTEXT.Trigger.modeGreedy",

  "this.ability": "TERIOCK.ROLL_CONTEXT.Relation.ability",
  "this.actor": "TERIOCK.ROLL_CONTEXT.Relation.actor",
  "this.armament": "TERIOCK.ROLL_CONTEXT.Relation.armament",
  "this.effect": "TERIOCK.ROLL_CONTEXT.Relation.effect",
  "this.item": "TERIOCK.ROLL_CONTEXT.Relation.item",
  "this.source": "TERIOCK.ROLL_CONTEXT.Relation.source",
};

export default triggerContext;

preLocalizeConfig("ROLL_CONTEXT.trigger");
Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.attribute).forEach(([k, v]) => {
    triggerContext[`attribute.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Trigger.attribute", { name: v.abbreviation });
  });
  Object.entries(TERIOCK.CONFIG.tradecraft.tradecrafts).forEach(([k, v]) => {
    triggerContext[`tradecraft.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Trigger.tradecraft", { name: v.label });
  });
  Object.entries(TERIOCK.CONFIG.hack).forEach(([k, v]) => {
    triggerContext[`part.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Trigger.hack", { part: v.part });
  });
});
