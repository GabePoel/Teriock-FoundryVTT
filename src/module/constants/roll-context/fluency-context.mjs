import { preLocalize } from "../../helpers/localization.mjs";
import { tradecraftConfig } from "../config/tradecraft-config.mjs";
import usableContext from "./usable-context.mjs";

const fluencyContext = {
  ...usableContext,
  fluency: "TYPES.ActiveEffect.fluency",

  field: "TERIOCK.TERMS.Common.field",
  tc: "TERIOCK.TERMS.Common.tradecraft",
};

export default fluencyContext;

preLocalize("rollContext.fluency");
Hooks.once("i18nInit", () => {
  Object.entries(tradecraftConfig).forEach(([k, v]) => {
    fluencyContext[`field.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Fluency.field", {
      name: _loc(v.name),
    });
  });

  Object.entries(TERIOCK.reference.tradecrafts).forEach(([k, v]) => {
    fluencyContext[`tc.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Fluency.tradecraft", { name: _loc(v) });
  });
});
