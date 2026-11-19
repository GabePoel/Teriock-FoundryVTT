import { preLocalizeObject } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const conditionContext = {
  ...usableContext,
  morph: "TERIOCK.SCHEMA.Morph.enabled.label",
  "morph.primary": "TERIOCK.ROLL_CONTEXT.Morph.primary",
  "type.condition": "TYPES.ActiveEffect.condition",
};

export default conditionContext;

preLocalizeObject("ROLL_CONTEXT.condition");

Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.kind.default).forEach(([k, v]) => {
    conditionContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.kind", { name: v.label });
  });
});
