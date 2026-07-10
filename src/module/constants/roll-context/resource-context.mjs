import { preLocalizeConfig } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const resourceContext = { ...usableContext, resource: "TYPES.ActiveEffect.resource" };

export default resourceContext;

preLocalizeConfig("rollContext.resource");
