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

preLocalizeConfig("rollContext.trigger");
Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.config.attribute).forEach(([k, v]) => {
    triggerContext[`attribute.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Trigger.attribute", { name: _loc(v.abbreviation) });
  });
  Object.entries(TERIOCK.config.tradecraft.tradecrafts).forEach(([k, v]) => {
    triggerContext[`tradecraft.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Trigger.tradecraft", { name: _loc(v.label) });
  });
  Object.entries(TERIOCK.config.hack).forEach(([k, v]) => {
    triggerContext[`part.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Trigger.hack", { part: _loc(v.part) });
  });
});
