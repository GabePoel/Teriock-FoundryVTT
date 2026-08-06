import { preLocalizeConfig } from "../../helpers/localization.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";

const imbuementContext = { imbuement: "TYPES.ActiveEffect.imbuement" };

export default imbuementContext;

Hooks.once("teriock.i18nMetaphysicsInit", () => {
  Object.assign(imbuementContext, metaphysicsContext);
});

preLocalizeConfig("rollContext.imbuement");
