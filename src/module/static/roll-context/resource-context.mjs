import { preLocalizeObject } from "../../helpers/localization.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";
import usableContext from "./usable-context.mjs";

const resourceContext = { ...usableContext, resource: "TYPES.ActiveEffect.resource" };

export default resourceContext;

Hooks.once("teriock.metaphysicsContextInit", () => {
  Object.assign(resourceContext, metaphysicsContext);
});

preLocalizeObject("ROLL_CONTEXT.resource");
