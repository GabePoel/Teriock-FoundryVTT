import { preLocalize } from "../../helpers/localization.mjs";
import { attunementConfig } from "../config/attunement-config.mjs";
import usableContext from "./usable-context.mjs";

const attunementContext = {
  ...usableContext,
  attunement: "TYPES.ActiveEffect.attunement",

  tier: "TERIOCK.SYSTEMS.Attunement.FIELDS.tier.label",
  target: "TERIOCK.SYSTEMS.Attunement.FIELDS.target.label",
  type: "TERIOCK.SYSTEMS.Attunement.FIELDS.type.label",
};

export default attunementContext;

preLocalize("rollContext.attunement");
Hooks.once("i18nInit", () => {
  Object.entries(attunementConfig.type).forEach(([k, v]) => {
    attunementContext[`type.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Attunement.type", {
      name: _loc(v.label),
    });
  });
});
