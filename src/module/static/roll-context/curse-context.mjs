import { preLocalizeObject } from "../../helpers/localization.mjs";
import simpleContext from "./simple-context.mjs";

const curseContext = { curse: "TYPES.Item.curse" };

export default curseContext;

preLocalizeObject("ROLL_CONTEXT.curse");
Hooks.once("teriock.identifiersInit", () => {
  Object.assign(curseContext, simpleContext);
});
