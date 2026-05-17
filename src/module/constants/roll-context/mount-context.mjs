import { preLocalize } from "../../helpers/localization.mjs";
import { toCamelCase } from "../../helpers/string.mjs";
import usableContext from "./usable-context.mjs";

const mountContext = {
  ...usableContext,
  mount: "TYPES.Item.mount",

  attuned: "TERIOCK.SYSTEMS.Attunement.USAGE.attuned",
  mounted: "TERIOCK.SYSTEMS.Mount.FIELDS.mounted.label",
  tier: "TERIOCK.SYSTEMS.Attunable.FIELDS.tier.raw.label",

  hp: "TERIOCK.SYSTEMS.StatGiver.FIELDS.statDice.hp.label",
  "hp.disabled": "TERIOCK.MODELS.BaseStatPool.FIELDS.disabled.label",
  "hp.value": "TERIOCK.ROLL_CONTEXT.StatDice.hpTotal",
  mp: "TERIOCK.SYSTEMS.StatGiver.FIELDS.statDice.mp.label",
  "mp.disabled": "TERIOCK.MODELS.BaseStatPool.FIELDS.disabled.label",
  "mp.value": "TERIOCK.ROLL_CONTEXT.StatDice.mpTotal",
};

export default mountContext;

preLocalize("rollContext.mount");
Hooks.once("i18nInit", () => {
  Object.entries(TERIOCK.reference.creatures).forEach(([k, v]) => {
    mountContext[`type.${toCamelCase(k)}`] = _loc("TERIOCK.ROLL_CONTEXT.Mount.type", { name: _loc(v) });
  });
});
