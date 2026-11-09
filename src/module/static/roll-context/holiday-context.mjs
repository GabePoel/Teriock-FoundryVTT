import { preLocalizeObject } from "../../helpers/localization.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";
import usableContext from "./usable-context.mjs";

const holidayContext = {
  ...usableContext,
  holiday: "TYPES.ActiveEffect.holiday",
  transformation: "TERIOCK.SCHEMA.Transformation.enabled.label",
  "transformation.primary": "TERIOCK.ROLL_CONTEXT.Transformation.primary",
};

export default holidayContext;

Hooks.once("teriock.metaphysicsContextInit", () => {
  Object.assign(holidayContext, metaphysicsContext);
});

preLocalizeObject("ROLL_CONTEXT.holiday");

Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.effect.kind).forEach(([k, v]) => {
    holidayContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.kind", { name: v.label });
  });
});
