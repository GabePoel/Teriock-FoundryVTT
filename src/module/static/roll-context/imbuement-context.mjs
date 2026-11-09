import { preLocalizeObject } from "../../helpers/localization.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";
import usableContext from "./usable-context.mjs";

const imbuementContext = { ...usableContext, imbuement: "TYPES.ActiveEffect.imbuement" };

export default imbuementContext;

Hooks.once("teriock.metaphysicsContextInit", () => {
  Object.assign(imbuementContext, metaphysicsContext);
});

preLocalizeObject("ROLL_CONTEXT.imbuement");

Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.system.defaultKinds).forEach(([k, v]) => {
    imbuementContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.kind", { name: v.label });
  });
});
