import { preLocalizeObject } from "../../helpers/localization.mjs";

/** @category Transformation */
const config = {
  attributeChange: {
    get phase() {
      return TERIOCK.CONFIG.ability.attributeChange.phase;
    },
    get priority() {
      return TERIOCK.CONFIG.ability.attributeChange.priority + 1;
    },
  },
  // no sort
  level: {
    minor: "TERIOCK.EFFECTS.TransformationLevel.minor",
    full: "TERIOCK.EFFECTS.TransformationLevel.full",
    greater: "TERIOCK.EFFECTS.TransformationLevel.greater",
  },
  multiCheckboxPaths: ["attributes", "override", "resets", "suppress"],
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

preLocalizeObject("CONFIG.transformation.level");
preLocalizeObject("CONFIG.transformation.override", { key: "label" });
preLocalizeObject("CONFIG.transformation.suppress", { key: "label" });
