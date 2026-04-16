import { preLocalize } from "../../helpers/localization.mjs";
import { effectOptions } from "../options/effect-options.mjs";
import usableContext from "./usable-context.mjs";

const propertyContext = {
  ...usableContext,
  property: "TYPES.ActiveEffect.property",

  form: "TERIOCK.SYSTEMS.BaseEffect.FIELDS.form.label",
  "damage.type": "TERIOCK.SYSTEMS.Property.FIELDS.damageType.label",
  "damage.extra": "TERIOCK.ROLL_CONTEXT.Property.extraDamage",
};

export default propertyContext;

preLocalize("rollContext.property");
Hooks.once("i18nInit", () => {
  Object.entries(effectOptions.form).forEach(([k, v]) => {
    propertyContext[`form.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.form", {
      name: _loc(v.label),
    });
  });
  Object.entries(TERIOCK.reference.damageTypes).forEach(([k, v]) => {
    propertyContext[`damage.type.${k}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Property.damageType",
      { name: _loc(v) },
    );
  });
});
