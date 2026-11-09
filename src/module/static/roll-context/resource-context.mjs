import { preLocalizeObject } from "../../helpers/localization.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";
import usableContext from "./usable-context.mjs";

const resourceContext = {
  ...usableContext,
  resource: "TYPES.ActiveEffect.resource",

  consumable: "TERIOCK.SYSTEMS.Consumable.FIELDS.consumption.enabled.label",
  max: "TERIOCK.SYSTEMS.Consumable.FIELDS.quantity.maxFormula.label",
  quantity: "TERIOCK.SYSTEMS.Consumable.FIELDS.quantity.value.label",
  "quantity.max": "TERIOCK.SYSTEMS.Consumable.FIELDS.quantity.maxFormula.label",
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
