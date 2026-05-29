import { preLocalize } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const rankContext = {
  ...usableContext,
  rank: "TYPES.Item.rank",

  archetype: "TERIOCK.SYSTEMS.Rank.FIELDS.archetype.label",
  av: "TERIOCK.SYSTEMS.BaseItem.FIELDS.maxAv.label",
  class: "TERIOCK.SYSTEMS.Rank.FIELDS.class.label",
  innate: "TERIOCK.SYSTEMS.Rank.FIELDS.innate.label",
  maxAv: "TERIOCK.SYSTEMS.BaseItem.FIELDS.maxAv.label",
  number: "TERIOCK.SYSTEMS.Rank.FIELDS.number.label",
};

export default rankContext;

preLocalize("rollContext.rank");
Hooks.once("i18nInit", () => {
  Object.entries(TERIOCK.reference.classes).forEach(([k, v]) => {
    rankContext[`class.${k.slice(0, 3).toLowerCase()}`] = _loc("TERIOCK.ROLL_CONTEXT.Rank.class", { name: _loc(v) });
  });
  Object.entries(TERIOCK.config.class.archetypes).forEach(([k, v]) => {
    rankContext[`archetype.${k.slice(0, 3)}`] = _loc("TERIOCK.ROLL_CONTEXT.Rank.class", { name: _loc(v.label) });
  });
});
