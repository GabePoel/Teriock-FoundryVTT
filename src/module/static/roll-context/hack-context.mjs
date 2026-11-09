import { preLocalizeObject } from "../../helpers/localization.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";
import usableContext from "./usable-context.mjs";

const hackContext = { ...usableContext, hack: "TYPES.ActiveEffect.hack" };

export default hackContext;

preLocalizeObject("ROLL_CONTEXT.hack");
Hooks.once("teriock.metaphysicsContextInit", () => {
  Object.assign(hackContext, metaphysicsContext);
});
Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.system.defaultKinds).forEach(([k, v]) => {
    hackContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.kind", { name: v.label });
  });
});
