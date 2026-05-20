import { preLocalize } from "../../helpers/localization.mjs";
import { effectConfig } from "../config/effect-config.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";
import usableContext from "./usable-context.mjs";

const propertyContext = {
  ...usableContext,
  property: "TYPES.ActiveEffect.property",

  "damage.extra": "TERIOCK.ROLL_CONTEXT.Property.extraDamage",
  "damage.type": "TERIOCK.SYSTEMS.Property.FIELDS.damageType.label",
  form: "TERIOCK.SYSTEMS.BaseEffect.FIELDS.form.label",
};

export default propertyContext;

preLocalize("rollContext.property");
Hooks.once("i18nInit", () => {
  Object.entries(effectConfig.form).forEach(([k, v]) => {
    propertyContext[`form.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.form", {
      name: _loc(v.label),
    });
  });
  Object.entries(TERIOCK.reference.damageTypes).forEach(([k, v]) => {
    propertyContext[`damage.type.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Property.damageType", { name: _loc(v) });
  });
});

Hooks.once("teriock.i18nMetaphysicsInit", () => {
  Object.assign(propertyContext, metaphysicsContext);
});
