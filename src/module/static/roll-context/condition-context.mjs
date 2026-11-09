import { preLocalizeObject } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const conditionContext = {
  ...usableContext,
  condition: "TYPES.ActiveEffect.condition",
  transformation: "TERIOCK.SCHEMA.Transformation.enabled.label",
  "transformation.primary": "TERIOCK.ROLL_CONTEXT.Transformation.primary",
};

export default conditionContext;

preLocalizeObject("ROLL_CONTEXT.condition");

Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.system.defaultKinds).forEach(([k, v]) => {
    conditionContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.kind", { name: v.label });
  });
});
