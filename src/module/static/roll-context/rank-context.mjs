import { preLocalizeConfig } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const rankContext = {
  ...usableContext,
  rank: "TYPES.Item.rank",

  maxAv: "TERIOCK.SYSTEMS.BaseItem.FIELDS.maxAv.label",
  number: "TERIOCK.SYSTEMS.Rank.FIELDS.number.label",
};

export default rankContext;

preLocalizeConfig("ROLL_CONTEXT.rank");
Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.class.classes).forEach(([k, v]) => {
    rankContext[`class.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Rank.class", { name: v.label });
  });
  Object.entries(TERIOCK.CONFIG.class.archetypes).forEach(([k, v]) => {
    rankContext[`archetype.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Rank.class", { name: v.label });
  });
  Object.entries(TERIOCK.CONFIG.class.kind).forEach(([k, v]) => {
    rankContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Rank.kind", { name: v.label });
  });
});
