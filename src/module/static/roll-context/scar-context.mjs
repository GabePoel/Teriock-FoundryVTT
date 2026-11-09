import { preLocalizeObject } from "../../helpers/localization.mjs";
import simpleContext from "./simple-context.mjs";

const scarContext = { scar: "TYPES.Item.scar" };

export default scarContext;

preLocalizeObject("ROLL_CONTEXT.scar");
Hooks.once("teriock.identifiersInit", () => {
  Object.assign(scarContext, simpleContext);
});
