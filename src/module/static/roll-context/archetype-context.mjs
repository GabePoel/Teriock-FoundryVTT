import { preLocalizeObject } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const archetypeContext = {
  ...usableContext,
  archetype: "TYPES.Item.archetype",
  "av.max": "TERIOCK.SYSTEMS.BaseItem.FIELDS.maxAv.label",
};

export default archetypeContext;

preLocalizeObject("ROLL_CONTEXT.archetype");

Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.system.defaultKinds).forEach(([k, v]) => {
    archetypeContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.kind", { name: v.label });
  });
});
