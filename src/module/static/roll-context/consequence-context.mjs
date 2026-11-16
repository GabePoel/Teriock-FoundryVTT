import { preLocalizeObject } from "../../helpers/localization.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";
import usableContext from "./usable-context.mjs";

const consequenceContext = {
  ...usableContext,
  transformation: "TERIOCK.SCHEMA.Transformation.enabled.label",
  "transformation.primary": "TERIOCK.ROLL_CONTEXT.Transformation.primary",
  "type.consequence": "TYPES.ActiveEffect.consequence",
};

export default consequenceContext;

Hooks.once("teriock.metaphysicsContextInit", () => {
  Object.assign(consequenceContext, metaphysicsContext);
});

preLocalizeObject("ROLL_CONTEXT.consequence");

Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.system.defaultKinds).forEach(([k, v]) => {
    consequenceContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.kind", { name: v.label });
  });
});
