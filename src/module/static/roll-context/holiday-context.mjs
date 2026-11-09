import { preLocalizeObject } from "../../helpers/localization.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";
import usableContext from "./usable-context.mjs";

const holidayContext = { ...usableContext, holiday: "TYPES.ActiveEffect.holiday" };

export default holidayContext;

Hooks.once("teriock.metaphysicsContextInit", () => {
  Object.assign(holidayContext, metaphysicsContext);
});

preLocalizeObject("ROLL_CONTEXT.holiday");
