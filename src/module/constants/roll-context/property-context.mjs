import { preLocalizeConfig } from "../../helpers/localization.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";
import usableContext from "./usable-context.mjs";

const propertyContext = {
  ...usableContext,
  property: "TYPES.ActiveEffect.property",

  "dmg.extra": "TERIOCK.ROLL_CONTEXT.Property.extraDamage",
  "dmg.type": "TERIOCK.SYSTEMS.Property.FIELDS.damageType.label",
  form: "TERIOCK.SYSTEMS.BaseEffect.FIELDS.form.label",
};

export default propertyContext;

preLocalizeConfig("rollContext.property");
Hooks.once("i18nInit", () => {
  Object.entries(TERIOCK.config.effect.form).forEach(([k, v]) => {
    propertyContext[`form.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.form", { name: _loc(v.label) });
  });
  Object.entries(TERIOCK.reference.damageTypes).forEach(([k, v]) => {
    propertyContext[`dmg.type.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Property.damageType", { name: _loc(v) });
  });
});

Hooks.once("teriock.i18nMetaphysicsInit", () => {
  Object.assign(propertyContext, metaphysicsContext);
});
