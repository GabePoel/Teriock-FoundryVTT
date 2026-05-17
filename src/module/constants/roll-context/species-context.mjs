import { preLocalize } from "../../helpers/localization.mjs";
import { transformationConfig } from "../config/transformation-config.mjs";
import usableContext from "./usable-context.mjs";

const speciesContext = {
  ...usableContext,
  species: "TYPES.Item.species",

  transformation: "TERIOCK.SYSTEMS.Species.FIELDS.transformationLevel.label",
  "transformation.primary": "TERIOCK.SYSTEMS.Species.MENU.setPrimaryTransformation",
  "transformation.level": "TERIOCK.SYSTEMS.Species.FIELDS.transformationLevel.label",
  size: "TERIOCK.SYSTEMS.Species.FIELDS.size.value.label",
  "size.max": "TERIOCK.SYSTEMS.Species.FIELDS.size.max.label",
  "size.min": "TERIOCK.SYSTEMS.Species.FIELDS.size.min.label",
  "size.enabled": "TERIOCK.SYSTEMS.Species.FIELDS.size.enabled.label",
  adult: "TERIOCK.SYSTEMS.Species.FIELDS.adult.label",
  lifespan: "TERIOCK.SYSTEMS.Species.FIELDS.lifespan.label",
  br: "TERIOCK.SYSTEMS.Species.FIELDS.br.label",
};

export default speciesContext;

preLocalize("rollContext.species");
Hooks.once("i18nInit", () => {
  Object.entries(transformationConfig.level).forEach(([k, v]) => {
    speciesContext[`transformation.level.${k}`] = _loc(v);
  });
  Object.entries(TERIOCK.reference.traits).forEach(([k, v]) => {
    speciesContext[`trait.${k}`] = _loc(v);
  });
});
