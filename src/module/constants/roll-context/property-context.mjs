import { preLocalizeConfig } from "../../helpers/localization.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";
import usableContext from "./usable-context.mjs";

const propertyContext = {
  ...usableContext,
  property: "TYPES.ActiveEffect.property",

  "dmg.extra": "TERIOCK.ROLL_CONTEXT.Property.extraDamage",
  "dmg.type": "TERIOCK.SYSTEMS.Property.FIELDS.damageType.label",
  kind: "TERIOCK.SYSTEMS.BaseEffect.FIELDS.kind.label",
};

export default propertyContext;

preLocalizeConfig("rollContext.property");
Hooks.once("i18nInit", () => {
  Object.entries(TERIOCK.config.effect.kind).forEach(([k, v]) => {
    propertyContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.kind", { name: _loc(v.label) });
  });
  Object.entries(TERIOCK.reference.damageTypes).forEach(([k, v]) => {
    propertyContext[`dmg.type.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Property.damageType", { name: _loc(v) });
  });
});

Hooks.once("teriock.i18nMetaphysicsInit", () => {
  Object.assign(propertyContext, metaphysicsContext);
});
