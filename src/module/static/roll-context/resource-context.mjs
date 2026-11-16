import { preLocalizeObject } from "../../helpers/localization.mjs";
import consumableContext from "./consumable-context.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";
import usableContext from "./usable-context.mjs";

const resourceContext = {
  ...consumableContext,
  ...usableContext,
  "type.resource": "TYPES.ActiveEffect.resource",

  revealed: "TERIOCK.SYSTEMS.Revealable.FIELDS.revealed.label",
};

export default resourceContext;

Hooks.once("teriock.metaphysicsContextInit", () => {
  Object.assign(resourceContext, metaphysicsContext);
});

preLocalizeObject("ROLL_CONTEXT.resource");

Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.effect.kind).forEach(([k, v]) => {
    resourceContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.kind", { name: v.label });
  });
});
