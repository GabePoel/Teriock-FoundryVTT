import { preLocalizeObject } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const powerContext = {
  ...usableContext,
  backstory: "TYPES.Item.backstory",
  blessing: "TYPES.Item.blessing",
  curse: "TYPES.Item.curse",
  familiar: "TYPES.Item.familiar",
  pact: "TYPES.Item.pact",
  power: "TYPES.Item.power",
  scar: "TYPES.Item.scar",

  av: "TERIOCK.SYSTEMS.BaseItem.FIELDS.maxAv.label",
  maxAv: "TERIOCK.SYSTEMS.BaseItem.FIELDS.maxAv.label",

  hp: "TERIOCK.SYSTEMS.StatGiver.FIELDS.statDice.hp.label",
  "hp.disabled": "TERIOCK.MODELS.BaseStatPool.FIELDS.disabled.label",
  "hp.value": "TERIOCK.ROLL_CONTEXT.StatDice.hpTotal",
  mp: "TERIOCK.SYSTEMS.StatGiver.FIELDS.statDice.mp.label",
  "mp.disabled": "TERIOCK.MODELS.BaseStatPool.FIELDS.disabled.label",
  "mp.value": "TERIOCK.ROLL_CONTEXT.StatDice.mpTotal",
};

export default powerContext;

preLocalizeObject("ROLL_CONTEXT.power");
Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.power.kind).forEach(([k, v]) => {
    powerContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Power.kind", { name: v.label });
  });
});
