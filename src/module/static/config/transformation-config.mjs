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
    backstory: { initial: true, label: "TYPES.Item.backstory", path: "system.disabled" },
    blessing: { initial: true, label: "TYPES.Item.blessing", path: "system.disabled" },
    body: { initial: true, label: "TYPES.Item.body", path: "system.disabled" },
    consequence: { initial: false, label: "TYPES.ActiveEffect.consequence", path: "disabled" },
    curse: { initial: false, label: "TYPES.Item.curse", path: "system.disabled" },
    equipment: { initial: true, label: "TYPES.Item.equipment", path: "system.stashed" },
    familiar: { initial: true, label: "TYPES.Item.familiar", path: "system.disabled" },
    fluency: { initial: true, label: "TYPES.ActiveEffect.fluency", path: "system.disabled" },
    mount: { initial: false, label: "TYPES.Item.mount", path: "system.disabled" },
    pact: { initial: true, label: "TYPES.Item.pact", path: "system.disabled" },
    rank: { initial: true, label: "TYPES.Item.rank", path: "system.disabled" },
    resource: { initial: false, label: "TYPES.ActiveEffect.resource", path: "system.disabled" },
    scar: { initial: false, label: "TYPES.Item.scar", path: "system.disabled" },
    species: { initial: true, label: "TYPES.Item.species", path: "system.disabled" },
  },
  tokenChange: { phase: "initial", priority: 5 },
};

export default config;

preLocalizeObject("CONFIG.transformation.level");
preLocalizeObject("CONFIG.transformation.override", { key: "label" });
preLocalizeObject("CONFIG.transformation.suppress", { key: "label" });
