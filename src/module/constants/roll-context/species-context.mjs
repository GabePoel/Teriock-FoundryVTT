import { preLocalize } from "../../helpers/localization.mjs";
import usableContext from "./usable-context.mjs";

const speciesContext = {
  ...usableContext,
  species: "TYPES.Item.species",

  adult: "TERIOCK.SYSTEMS.Species.FIELDS.adult.label",
  br: "TERIOCK.SYSTEMS.Species.FIELDS.br.label",
  lifespan: "TERIOCK.SYSTEMS.Species.FIELDS.lifespan.label",
  size: "TERIOCK.SYSTEMS.Species.FIELDS.size.value.label",
  "size.enabled": "TERIOCK.SYSTEMS.Species.FIELDS.size.enabled.label",
  "size.max": "TERIOCK.SYSTEMS.Species.FIELDS.size.max.label",
  "size.min": "TERIOCK.SYSTEMS.Species.FIELDS.size.min.label",
  transformation: "TERIOCK.SYSTEMS.Species.FIELDS.transformationLevel.label",
  "transformation.level": "TERIOCK.SYSTEMS.Species.FIELDS.transformationLevel.label",
  "transformation.primary": "TERIOCK.SYSTEMS.Species.MENU.setPrimaryTransformation",
};

export default speciesContext;

preLocalize("rollContext.species");
Hooks.once("i18nInit", () => {
  Object.entries(TERIOCK.config.transformation.level).forEach(([k, v]) => {
    speciesContext[`transformation.level.${k}`] = _loc(v);
  });
  Object.entries(TERIOCK.reference.traits).forEach(([k, v]) => {
    speciesContext[`trait.${k}`] = _loc(v);
  });
});
