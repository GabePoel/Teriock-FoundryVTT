import { preLocalize } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const consequenceContext = {
  ...usableContext,
  consequence: "TYPES.ActiveEffect.consequence",
};

export default consequenceContext;

preLocalize("rollContext.consequence");
