import { preLocalizeConfig } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const speciesContext = {
  ...usableContext,
  species: "TYPES.Item.species",

  br: "TERIOCK.SYSTEMS.Species.FIELDS.br.label",
  lifespan: "TERIOCK.SYSTEMS.Species.FIELDS.lifespan.max.label",
  "lifespan.adulthood": "TERIOCK.SYSTEMS.Species.FIELDS.lifespan.adulthood.label",
  "lifespan.enabled": "TERIOCK.SYSTEMS.Species.FIELDS.lifespan.enabled.label",
  "lifespan.max": "TERIOCK.SYSTEMS.Species.FIELDS.lifespan.max.label",
  size: "TERIOCK.SYSTEMS.Species.FIELDS.size.value.label",
  "size.enabled": "TERIOCK.SYSTEMS.Species.FIELDS.size.enabled.label",
  "size.max": "TERIOCK.SYSTEMS.Species.FIELDS.size.max.label",
  "size.min": "TERIOCK.SYSTEMS.Species.FIELDS.size.min.label",
  transformation: "TERIOCK.SYSTEMS.Species.FIELDS.transformationLevel.label",
  "transformation.level": "TERIOCK.SYSTEMS.Species.FIELDS.transformationLevel.label",
  "transformation.primary": "TERIOCK.SYSTEMS.Species.MENU.setPrimaryTransformation",
};

export default speciesContext;

preLocalizeConfig("ROLL_CONTEXT.species");
Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.transformation.level).forEach(([k, v]) => {
    speciesContext[`transformation.level.${k}`] = v;
  });
  Object.entries(TERIOCK.CONFIG.species.traits).forEach(([k, v]) => {
    speciesContext[`trait.${k}`] = v.label;
  });
});
