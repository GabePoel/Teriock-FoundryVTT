import { preLocalizeConfig } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const powerContext = {
  ...usableContext,
  power: "TYPES.Item.power",

  av: "TERIOCK.SYSTEMS.BaseItem.FIELDS.maxAv.label",
  maxAv: "TERIOCK.SYSTEMS.BaseItem.FIELDS.maxAv.label",
  type: "TERIOCK.SYSTEMS.Power.FIELDS.type.label",

  hp: "TERIOCK.SYSTEMS.StatGiver.FIELDS.statDice.hp.label",
  "hp.disabled": "TERIOCK.MODELS.BaseStatPool.FIELDS.disabled.label",
  "hp.value": "TERIOCK.ROLL_CONTEXT.StatDice.hpTotal",
  mp: "TERIOCK.SYSTEMS.StatGiver.FIELDS.statDice.mp.label",
  "mp.disabled": "TERIOCK.MODELS.BaseStatPool.FIELDS.disabled.label",
  "mp.value": "TERIOCK.ROLL_CONTEXT.StatDice.mpTotal",
};

export default powerContext;

preLocalizeConfig("rollContext.power");
Hooks.once("i18nInit", () => {
  Object.entries(TERIOCK.config.power.type).forEach(([k, v]) => {
    powerContext[`type.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Power.type", { name: _loc(v.label) });
  });
});
