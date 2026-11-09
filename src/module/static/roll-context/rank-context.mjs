import { preLocalizeObject } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const rankContext = {
  ...usableContext,
  rank: "TYPES.Item.rank",

  "av.max": "TERIOCK.SYSTEMS.BaseItem.FIELDS.maxAv.label",
  number: "TERIOCK.SYSTEMS.Rank.FIELDS.number.label",

  hp: "TERIOCK.SYSTEMS.Statted.FIELDS.statDice.hp.label",
  "hp.disabled": "TERIOCK.ROLL_CONTEXT.StatDice.hpDisabled",
  "hp.value": "TERIOCK.ROLL_CONTEXT.StatDice.hpTotal",
  mp: "TERIOCK.SYSTEMS.Statted.FIELDS.statDice.mp.label",
  "mp.disabled": "TERIOCK.ROLL_CONTEXT.StatDice.mpDisabled",
  "mp.value": "TERIOCK.ROLL_CONTEXT.StatDice.mpTotal",
};

export default rankContext;

preLocalizeObject("ROLL_CONTEXT.rank");
Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.class.classes).forEach(([k, v]) => {
    rankContext[`class.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Rank.class", { name: v.label });
  });
  Object.entries(TERIOCK.CONFIG.class.archetypes).forEach(([k, v]) => {
    rankContext[`archetype.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Rank.archetype", { name: v.label });
  });
  Object.entries(TERIOCK.CONFIG.class.kind).forEach(([k, v]) => {
    rankContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Rank.kind", { name: v.label });
  });
});
