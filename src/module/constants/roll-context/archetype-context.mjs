import { preLocalize } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const archetypeContext = {
  ...usableContext,
  archetype: "TYPES.Item.archetype",
};

export default archetypeContext;

preLocalize("rollContext.archetype");
