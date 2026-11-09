import { preLocalizeObject } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const mountContext = {
  ...usableContext,
  mount: "TYPES.Item.mount",

  attuned: "TERIOCK.SYSTEMS.Attunement.USAGE.attuned",
  mounted: "TERIOCK.SYSTEMS.Mount.FIELDS.mounted.label",
  price: "TERIOCK.SYSTEMS.Equipment.FIELDS.price.label",
  tier: "TERIOCK.SYSTEMS.Attunable.FIELDS.tier.raw.label",

  hp: "TERIOCK.SYSTEMS.Statted.FIELDS.statDice.hp.label",
  "hp.disabled": "TERIOCK.ROLL_CONTEXT.StatDice.hpDisabled",
  "hp.value": "TERIOCK.ROLL_CONTEXT.StatDice.hpTotal",
  mp: "TERIOCK.SYSTEMS.Statted.FIELDS.statDice.mp.label",
  "mp.disabled": "TERIOCK.ROLL_CONTEXT.StatDice.mpDisabled",
  "mp.value": "TERIOCK.ROLL_CONTEXT.StatDice.mpTotal",
};

export default mountContext;

preLocalizeObject("ROLL_CONTEXT.mount");

Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.system.defaultKinds).forEach(([k, v]) => {
    mountContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.kind", { name: v.label });
  });
});
