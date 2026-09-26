import { preLocalizeConfig } from "../../helpers/localization.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";
import usableContext from "./usable-context.mjs";

const propertyContext = {
  ...usableContext,
  property: "TYPES.ActiveEffect.property",

  "dmg.extra": "TERIOCK.ROLL_CONTEXT.Property.extraDamage",
};

export default propertyContext;

preLocalizeConfig("rollContext.property");
Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.config.effect.kind).forEach(([k, v]) => {
    propertyContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.kind", { name: _loc(v.label) });
  });
  Object.entries(game.teriock.identifiers.getNames("damage", { permission: "LIMITED" })).forEach(([k, name]) => {
    propertyContext[`dmg.type.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Property.damageType", { name });
  });
});

Hooks.once("teriock.metaphysicsContextInit", () => {
  Object.assign(propertyContext, metaphysicsContext);
});
