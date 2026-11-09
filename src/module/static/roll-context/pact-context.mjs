import { preLocalizeObject } from "../../helpers/localization.mjs";
import contractContext from "./contract-context.mjs";

const pactContext = { pact: "TYPES.Item.pact" };

export default pactContext;

preLocalizeObject("ROLL_CONTEXT.pact");
Hooks.once("teriock.identifiersInit", () => {
  Object.assign(pactContext, contractContext);
});
