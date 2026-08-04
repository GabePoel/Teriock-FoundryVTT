import { preLocalizeConfig } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const attunementContext = {
  ...usableContext,
  attunement: "TYPES.ActiveEffect.attunement",

  kind: "TERIOCK.SYSTEMS.Attunement.FIELDS.kind.label",
  target: "TERIOCK.SYSTEMS.Attunement.FIELDS.target.label",
  tier: "TERIOCK.SYSTEMS.Attunement.FIELDS.tier.label",
};

export default attunementContext;

preLocalizeConfig("rollContext.attunement");
Hooks.once("i18nInit", () => {
  Object.entries(TERIOCK.config.attunement.kind).forEach(([k, v]) => {
    attunementContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Attunement.kind", { name: _loc(v.label) });
  });
});
