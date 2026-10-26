import { preLocalizeObject } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const archetypeContext = { ...usableContext, archetype: "TYPES.Item.archetype" };

export default archetypeContext;

preLocalizeObject("ROLL_CONTEXT.archetype");
