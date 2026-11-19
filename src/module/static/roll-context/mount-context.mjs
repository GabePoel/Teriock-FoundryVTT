import { preLocalizeObject } from "../../helpers/localization.mjs";
import stattedContext from "./statted-context.mjs";
import usableContext from "./usable-context.mjs";

const mountContext = {
  ...usableContext,
  "type.mount": "TYPES.Item.mount",

  attuned: "TERIOCK.SYSTEMS.Attunement.USAGE.attuned",
  mounted: "TERIOCK.SYSTEMS.Mount.FIELDS.mounted.label",
  price: "TERIOCK.SYSTEMS.Equipment.FIELDS.price.label",
  tier: "TERIOCK.SYSTEMS.Attunable.FIELDS.tier.raw.label",

  ...stattedContext,
};

export default mountContext;

preLocalizeObject("ROLL_CONTEXT.mount");

Hooks.once("teriock.identifiersInit", () => {
  game.teriock.identifiers.mountTypes.entries().filter(([, e]) => e.name).forEach(([k, e]) => {
    mountContext[`mount.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Mount.mount", { name: e.name });
  });
  Object.entries(TERIOCK.CONFIG.kind.default).forEach(([k, v]) => {
    mountContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.kind", { name: v.label });
  });
});
