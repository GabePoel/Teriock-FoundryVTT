import { preLocalizeObject } from "../../helpers/localization.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";
import usableContext from "./usable-context.mjs";

const simpleContext = {
  ...usableContext,

  hp: "TERIOCK.SYSTEMS.Statted.FIELDS.statDice.hp.label",
  "hp.disabled": "TERIOCK.ROLL_CONTEXT.StatDice.hpDisabled",
  "hp.value": "TERIOCK.ROLL_CONTEXT.StatDice.hpTotal",
  mp: "TERIOCK.SYSTEMS.Statted.FIELDS.statDice.mp.label",
  "mp.disabled": "TERIOCK.ROLL_CONTEXT.StatDice.mpDisabled",
  "mp.value": "TERIOCK.ROLL_CONTEXT.StatDice.mpTotal",
};

export default simpleContext;

preLocalizeObject("ROLL_CONTEXT.simple");
Hooks.once("teriock.metaphysicsContextInit", () => {
  Object.assign(simpleContext, metaphysicsContext);
});
Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.system.defaultKinds).forEach(([k, v]) => {
    simpleContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.kind", { name: v.label });
  });
});
