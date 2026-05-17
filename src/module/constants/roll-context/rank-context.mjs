import { preLocalize } from "../../helpers/localization.mjs";
import { rankConfig } from "../config/rank-config.mjs";
import usableContext from "./usable-context.mjs";

const rankContext = {
  ...usableContext,
  rank: "TYPES.Item.rank",

  class: "TERIOCK.SYSTEMS.Rank.FIELDS.className.label",
  number: "TERIOCK.SYSTEMS.Rank.FIELDS.classRank.label",
  innate: "TERIOCK.SYSTEMS.Rank.FIELDS.innate.label",
  maxAv: "TERIOCK.SYSTEMS.BaseItem.FIELDS.maxAv.label",
  av: "TERIOCK.SYSTEMS.BaseItem.FIELDS.maxAv.label",
  archetype: "TERIOCK.SYSTEMS.Rank.FIELDS.archetype.label",
};

export default rankContext;

preLocalize("rollContext.rank");
Hooks.once("i18nInit", () => {
  Object.entries(TERIOCK.reference.classes).forEach(([k, v]) => {
    rankContext[`class.${k.slice(0, 3).toLowerCase()}`] = _loc("TERIOCK.ROLL_CONTEXT.Rank.class", { name: _loc(v) });
  });
  Object.entries(rankConfig).forEach(([k, v]) => {
    rankContext[`archetype.${k.slice(0, 3)}`] = _loc("TERIOCK.ROLL_CONTEXT.Rank.class", { name: _loc(v.name) });
  });
});
