import { preLocalizeConfig } from "../../helpers/localization.mjs";

export default {
  // no sort
  level: {
    minor: "TERIOCK.EFFECTS.TransformationLevel.minor",
    full: "TERIOCK.EFFECTS.TransformationLevel.full",
    greater: "TERIOCK.EFFECTS.TransformationLevel.greater",
  },
  override: {
    art: { initial: true, label: "TERIOCK.SCHEMA.Transformation.override.choices.art" },
    size: { initial: true, label: "TERIOCK.SCHEMA.Transformation.override.choices.size" },
  },
  suppress: {
    attunement: { initial: false, path: "disabled" },
    body: { initial: true, path: "system.disabled" },
    consequence: { initial: false, path: "disabled" },
    equipment: { initial: true, path: "system.stashed" },
    fluency: { initial: true, path: "system.disabled" },
    mount: { initial: false, path: "system.disabled" },
    rank: { initial: true, path: "system.disabled" },
    resource: { initial: false, path: "system.disabled" },
    species: { initial: true, path: "system.disabled" },
  },
};

preLocalizeConfig("config.transformation.level");
preLocalizeConfig("config.transformation.override", { key: "label" });
