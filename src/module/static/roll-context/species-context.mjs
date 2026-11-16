import { preLocalizeObject } from "../../helpers/localization.mjs";
import stattedContext from "./statted-context.mjs";
import usableContext from "./usable-context.mjs";

const speciesContext = {
  ...usableContext,
  "type.species": "TYPES.Item.species",

  br: "TERIOCK.SYSTEMS.Species.FIELDS.br.label",

  ...stattedContext,

  lifespan: "TERIOCK.SYSTEMS.Species.FIELDS.lifespan.max.label",
  "lifespan.adulthood": "TERIOCK.SYSTEMS.Species.FIELDS.lifespan.adulthood.label",
  "lifespan.enabled": "TERIOCK.ROLL_CONTEXT.Species.lifespanEnabled",
  "lifespan.max": "TERIOCK.SYSTEMS.Species.FIELDS.lifespan.max.label",
  size: "TERIOCK.SYSTEMS.Species.FIELDS.size.value.label",
  "size.enabled": "TERIOCK.ROLL_CONTEXT.Species.sizeEnabled",
  "size.max": "TERIOCK.SYSTEMS.Species.FIELDS.size.max.label",
  "size.min": "TERIOCK.SYSTEMS.Species.FIELDS.size.min.label",
  transformation: "TERIOCK.ROLL_CONTEXT.Species.transformation",
  "transformation.primary": "TERIOCK.ROLL_CONTEXT.Species.transformationPrimary",
};

export default speciesContext;

preLocalizeObject("ROLL_CONTEXT.species");
Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.transformation.level).forEach(([k, v]) => {
    speciesContext[`transformation.level.${k}`] = v;
  });
  Object.entries(TERIOCK.CONFIG.species.traits).forEach(([k, v]) => {
    speciesContext[`trait.${k}`] = v.label;
  });
  Object.entries(TERIOCK.CONFIG.system.defaultKinds).forEach(([k, v]) => {
    speciesContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.kind", { name: v.label });
  });
});
