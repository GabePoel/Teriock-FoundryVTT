import { preLocalizeObject } from "../../helpers/localization.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";

const imbuementContext = { imbuement: "TYPES.ActiveEffect.imbuement" };

export default imbuementContext;

Hooks.once("teriock.metaphysicsContextInit", () => {
  Object.assign(imbuementContext, metaphysicsContext);
});

preLocalizeObject("ROLL_CONTEXT.imbuement");
