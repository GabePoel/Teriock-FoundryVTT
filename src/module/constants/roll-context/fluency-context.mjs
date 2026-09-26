import { preLocalizeConfig } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const fluencyContext = { ...usableContext, fluency: "TYPES.ActiveEffect.fluency" };

export default fluencyContext;

preLocalizeConfig("rollContext.fluency");
Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.config.tradecraft.fields).forEach(([k, v]) => {
    fluencyContext[`field.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Fluency.field", { name: _loc(v.label) });
  });

  Object.entries(TERIOCK.config.tradecraft.tradecrafts).forEach(([k, v]) => {
    fluencyContext[`tradecraft.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Fluency.tradecraft", { name: _loc(v.label) });
  });
});
