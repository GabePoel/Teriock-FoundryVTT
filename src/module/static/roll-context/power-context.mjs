import { preLocalizeObject } from "../../helpers/localization.mjs";
import simpleContext from "./simple-context.mjs";

const powerContext = { "av.max": "TERIOCK.SYSTEMS.BaseItem.FIELDS.maxAv.label", power: "TYPES.Item.power" };

export default powerContext;

preLocalizeObject("ROLL_CONTEXT.power");
Hooks.once("teriock.identifiersInit", () => {
  Object.assign(powerContext, simpleContext);
});
