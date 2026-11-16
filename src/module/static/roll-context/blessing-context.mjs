import { preLocalizeObject } from "../../helpers/localization.mjs";
import contractContext from "./contract-context.mjs";

const blessingContext = { "type.blessing": "TYPES.Item.blessing" };

export default blessingContext;

preLocalizeObject("ROLL_CONTEXT.blessing");
Hooks.once("teriock.identifiersInit", () => {
  Object.assign(blessingContext, contractContext);
});
