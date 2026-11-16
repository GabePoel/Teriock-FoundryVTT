import { preLocalizeObject } from "../../helpers/localization.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";
import stattedContext from "./statted-context.mjs";
import usableContext from "./usable-context.mjs";

const simpleContext = { ...usableContext, ...stattedContext };

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
