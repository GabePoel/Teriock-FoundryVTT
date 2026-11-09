import { preLocalizeObject } from "../../helpers/localization.mjs";
import simpleContext from "./simple-context.mjs";

const backstoryContext = { backstory: "TYPES.Item.backstory", "av.max": "TERIOCK.SYSTEMS.BaseItem.FIELDS.maxAv.label" };

export default backstoryContext;

preLocalizeObject("ROLL_CONTEXT.backstory");
Hooks.once("teriock.identifiersInit", () => {
  Object.assign(backstoryContext, simpleContext);
});
