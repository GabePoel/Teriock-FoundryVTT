import { preLocalizeObject } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const conditionContext = { ...usableContext, condition: "TYPES.ActiveEffect.condition" };

export default conditionContext;

preLocalizeObject("ROLL_CONTEXT.condition");
