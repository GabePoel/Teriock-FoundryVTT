import { preLocalize } from "../../helpers/localization.mjs";
import { powerOptions } from "../options/power-options.mjs";
import usableContext from "./usable-context.mjs";

const powerContext = {
  ...usableContext,
  power: "TYPES.Item.power",

  type: "TERIOCK.SYSTEMS.Power.FIELDS.type.label",
  maxAv: "TERIOCK.SYSTEMS.BaseItem.FIELDS.maxAv.label",
  av: "TERIOCK.SYSTEMS.BaseItem.FIELDS.maxAv.label",
};

export default powerContext;

preLocalize("rollContext.power");
Hooks.once("i18nInit", () => {
  Object.entries(powerOptions.type).forEach(([k, v]) => {
    powerContext[`type.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Power.type", {
      name: _loc(v.label),
    });
  });
});
