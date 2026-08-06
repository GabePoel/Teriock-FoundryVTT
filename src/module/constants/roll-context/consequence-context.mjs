import { preLocalizeConfig } from "../../helpers/localization.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";
import usableContext from "./usable-context.mjs";

const consequenceContext = { ...usableContext, consequence: "TYPES.ActiveEffect.consequence" };

export default consequenceContext;

Hooks.once("teriock.i18nMetaphysicsInit", () => {
  Object.assign(consequenceContext, metaphysicsContext);
});

preLocalizeConfig("rollContext.consequence");
