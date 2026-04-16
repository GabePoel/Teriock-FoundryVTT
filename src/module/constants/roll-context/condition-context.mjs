import { preLocalize } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const conditionContext = {
  ...usableContext,
  condition: "TYPES.ActiveEffect.condition",
};

export default conditionContext;

preLocalize("rollContext.condition");
