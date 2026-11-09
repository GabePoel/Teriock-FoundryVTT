import { preLocalizeObject } from "../../helpers/localization.mjs";
import contractContext from "./contract-context.mjs";

const familiarContext = { familiar: "TYPES.Item.familiar" };

export default familiarContext;

preLocalizeObject("ROLL_CONTEXT.familiar");
Hooks.once("teriock.identifiersInit", () => {
  Object.assign(familiarContext, contractContext);
});
