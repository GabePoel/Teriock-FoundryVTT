import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { toKebabCase } from "../../helpers/string.mjs";
import usableContext from "./usable-context.mjs";

const rankContext = {
  ...usableContext,
  rank: "TYPES.Item.rank",

  archetype: "TERIOCK.SYSTEMS.Rank.FIELDS.archetype.label",
  class: "TERIOCK.SYSTEMS.Rank.FIELDS.class.label",
  kind: "TERIOCK.SYSTEMS.Rank.FIELDS.kind.label",
  maxAv: "TERIOCK.SYSTEMS.BaseItem.FIELDS.maxAv.label",
  number: "TERIOCK.SYSTEMS.Rank.FIELDS.number.label",
};

export default rankContext;

preLocalizeConfig("rollContext.rank");
Hooks.once("i18nInit", () => {
  Object.entries(TERIOCK.reference.classes).forEach(([k, v]) => {
    rankContext[`class.${toKebabCase(k)}`] = _loc("TERIOCK.ROLL_CONTEXT.Rank.class", { name: _loc(v) });
  });
  Object.entries(TERIOCK.config.class.archetypes).forEach(([k, v]) => {
    rankContext[`archetype.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Rank.class", { name: _loc(v.label) });
  });
  Object.entries(TERIOCK.config.class.kind).forEach(([k, v]) => {
    rankContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Rank.kind", { name: _loc(v.label) });
  });
});
