import { preLocalizeObject } from "../../helpers/localization.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";
import usableContext from "./usable-context.mjs";

const sorceryContext = {
  ...usableContext,
  sorcery: "TYPES.Item.sorcery",

  "av.max": "TERIOCK.SYSTEMS.BaseItem.FIELDS.maxAv.label",
};

export default sorceryContext;

preLocalizeObject("ROLL_CONTEXT.sorcery");
Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.system.defaultKinds).forEach(([k, v]) => {
    sorceryContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.kind", { name: v.label });
  });
});

Hooks.once("teriock.metaphysicsContextInit", () => {
  Object.assign(sorceryContext, metaphysicsContext);
});
