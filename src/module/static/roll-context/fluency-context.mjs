import { preLocalizeConfig } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const fluencyContext = { ...usableContext, fluency: "TYPES.ActiveEffect.fluency" };

export default fluencyContext;

preLocalizeConfig("ROLL_CONTEXT.fluency");
Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.tradecraft.fields).forEach(([k, v]) => {
    fluencyContext[`field.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Fluency.field", { name: v.label });
  });

  Object.entries(TERIOCK.CONFIG.tradecraft.tradecrafts).forEach(([k, v]) => {
    fluencyContext[`tradecraft.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Fluency.tradecraft", { name: v.label });
  });
});
