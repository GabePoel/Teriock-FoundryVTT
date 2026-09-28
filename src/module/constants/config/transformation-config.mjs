import { preLocalizeConfig } from "../../helpers/localization.mjs";

const config = {
  // no sort
  level: {
    minor: "TERIOCK.EFFECTS.TransformationLevel.minor",
    full: "TERIOCK.EFFECTS.TransformationLevel.full",
    greater: "TERIOCK.EFFECTS.TransformationLevel.greater",
  },
  multiCheckboxPaths: ["override", "resets", "suppress"],
  override: {
    art: { initial: true, label: "TERIOCK.SCHEMA.Transformation.override.choices.art" },
    size: { initial: true, label: "TERIOCK.SCHEMA.Transformation.override.choices.size" },
  },
  suppress: {
    attunement: { initial: false, label: "TYPES.ActiveEffect.attunement", path: "disabled" },
    body: { initial: true, label: "TYPES.Item.body", path: "system.disabled" },
    consequence: { initial: false, label: "TYPES.ActiveEffect.consequence", path: "disabled" },
    equipment: { initial: true, label: "TYPES.Item.equipment", path: "system.stashed" },
    fluency: { initial: true, label: "TYPES.ActiveEffect.fluency", path: "system.disabled" },
    mount: { initial: false, label: "TYPES.Item.mount", path: "system.disabled" },
    rank: { initial: true, label: "TYPES.Item.rank", path: "system.disabled" },
    resource: { initial: false, label: "TYPES.ActiveEffect.resource", path: "system.disabled" },
    species: { initial: true, label: "TYPES.Item.species", path: "system.disabled" },
  },
  tokenChange: { phase: "initial", priority: 5 },
};

export default config;

preLocalizeConfig("config.transformation.level");
preLocalizeConfig("config.transformation.override", { key: "label" });
preLocalizeConfig("config.transformation.suppress", { key: "label" });
