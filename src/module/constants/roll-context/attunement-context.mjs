import { preLocalizeConfig } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const attunementContext = {
  ...usableContext,
  attunement: "TYPES.ActiveEffect.attunement",

  origin: "TERIOCK.SYSTEMS.Attunement.FIELDS.origin.label",
  target: "TERIOCK.SYSTEMS.Attunement.FIELDS.target.label",
  tier: "TERIOCK.SYSTEMS.Attunement.FIELDS.tier.label",
};

export default attunementContext;

preLocalizeConfig("rollContext.attunement");
Hooks.once("i18nInit", () => {
  Object.entries(TERIOCK.config.attunement.origin).forEach(([k, v]) => {
    attunementContext[`origin.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Attunement.origin", { name: _loc(v.label) });
  });
});
