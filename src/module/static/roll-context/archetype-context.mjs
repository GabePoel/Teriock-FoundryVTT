import { preLocalizeConfig } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const archetypeContext = { ...usableContext, archetype: "TYPES.Item.archetype" };

export default archetypeContext;

preLocalizeConfig("ROLL_CONTEXT.archetype");
