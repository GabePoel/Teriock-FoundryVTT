import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { colors, images } from "../display/_module.mjs";

// TODO: Migrate everything to registry.
export default {
  categories: {
    abilities: {
      imgCategory: "abilities",
      label: "TYPES.ActiveEffect.ability",
      suggestions: "registry",
      type: "ability",
    },
    bodyParts: { imgCategory: "bodyParts", label: "TYPES.Item.body", suggestions: "registry", type: "body" },
    classes: { imgCategory: "classes", label: "TYPES.JournalEntryPage.class", suggestions: "registry", type: "class" },
    conditions: {
      imgCategory: "conditions",
      label: "TYPES.ActiveEffect.condition",
      suggestions: "registry",
      type: "condition",
    },
    damageTypes: {
      imgCategory: "damageTypes",
      label: "TYPES.JournalEntryPage.damage",
      suggestions: "registry",
      type: "damage",
    },
    drainTypes: {
      imgCategory: "drainTypes",
      label: "TYPES.JournalEntryPage.drain",
      suggestions: "registry",
      type: "drain",
    },
    effectTypes: {
      imgCategory: "effectTypes",
      label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.effectTypes.label",
      suggestions: "reference.effectTypes",
      type: "effect",
    },
    elements: {
      imgCategory: "elements",
      label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.elements.label",
      suggestions: "reference.elements",
      type: "element",
    },
    equipment: { imgCategory: "equipment", label: "TYPES.Item.equipment", suggestions: "registry", type: "equipment" },
    powerSources: {
      imgCategory: "effectTypes",
      label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.powerSources.label",
      suggestions: "reference.powerSources",
      type: "source",
    },
    properties: {
      imgCategory: "properties",
      label: "TYPES.ActiveEffect.property",
      suggestions: "registry",
      type: "property",
    },
    species: { imgCategory: "creatures", label: "TYPES.Item.species", suggestions: "registry", type: "species" },
    tradecrafts: {
      imgCategory: "tradecrafts",
      label: "TERIOCK.SHEETS.Actor.TABS.Tradecrafts.title",
      suggestions: "registry",
      type: "tradecraft",
    },

    other: { format: "none", imgCategory: "none", label: "TERIOCK.COMMON.Other", suggestions: "none" },
  },
  // no sort
  groups: {
    immunities: { label: "TERIOCK.SHEETS.Actor.TABS.Affinities.GROUPS.immunities", types: ["hexseal", "immunity"] },
    resistances: {
      label: "TERIOCK.SHEETS.Actor.TABS.Affinities.GROUPS.resistances",
      types: ["hexproof", "resistance", "vulnerability"],
    },
    boosts: { label: "TERIOCK.SHEETS.Actor.TABS.Affinities.GROUPS.boosts", types: ["takeDeboost", "takeBoost"] },
    bindings: { label: "TERIOCK.SHEETS.Actor.TABS.Affinities.GROUPS.bindings", types: ["binding"] },
    capabilities: {
      label: "TERIOCK.SHEETS.Actor.TABS.Affinities.GROUPS.capabilities",
      types: ["adeptitude", "ineptitude", "incapability"],
    },
  },
  // no sort
  types: {
    hexseal: {
      button: "TERIOCK.ROLLS.Hexseal.button",
      color: colors.palette.purple,
      hex: true,
      hook: "hexseal",
      identifier: "keyword:hexseal",
      img: images.manifest.effectTypes.hexseal,
      label: "TERIOCK.TERMS.Affinities.hexseal.single",
      protection: true,
    },
    immunity: {
      button: "TERIOCK.ROLLS.Immune.button",
      color: colors.palette.green,
      hook: "immune",
      identifier: "keyword:immunity",
      img: images.manifest.effectTypes.immunity,
      label: "TERIOCK.TERMS.Affinities.immunity.single",
      protection: true,
    },
    hexproof: {
      button: "TERIOCK.ROLLS.Hexproof.button",
      color: colors.palette.purple,
      competence: true,
      hex: true,
      hook: "hexproof",
      identifier: "keyword:hexproof",
      img: images.manifest.effectTypes.hexproof,
      label: "TERIOCK.TERMS.Affinities.hexproof.single",
      protection: true,
      threshold: true,
    },
    resistance: {
      button: "TERIOCK.ROLLS.Resist.button",
      color: colors.palette.green,
      competence: true,
      hook: "resist",
      identifier: "keyword:resistance",
      img: images.manifest.effectTypes.resistance,
      label: "TERIOCK.TERMS.Affinities.resistance.single",
      protection: true,
      threshold: true,
    },
    vulnerability: {
      color: colors.palette.red,
      identifier: "keyword:vulnerability",
      img: images.manifest.keywords.vulnerability,
      label: "TERIOCK.TERMS.Affinities.vulnerability.single",
      weakness: true,
    },
    takeBoost: {
      color: colors.palette.red,
      identifier: "keyword:boosted",
      img: images.manifest.keywords.boosted,
      label: "TERIOCK.TERMS.Affinities.takeBoost.single",
      stacking: true,
    },
    takeDeboost: {
      color: colors.palette.green,
      identifier: "keyword:deboosted",
      img: images.manifest.keywords.deboosted,
      label: "TERIOCK.TERMS.Affinities.takeDeboost.single",
      stacking: true,
    },
    binding: {
      color: colors.palette.red,
      identifier: "condition:bound",
      img: images.manifest.conditions.bound,
      label: "TERIOCK.TERMS.Affinities.binding.single",
      weakness: true,
    },
    adeptitude: {
      color: colors.palette.green,
      identifier: "keyword:adept",
      img: images.manifest.keywords.adept,
      label: "TERIOCK.TERMS.Affinities.adeptitude.single",
      stacking: true,
      tips: [{ level: "warning", text: "TERIOCK.TERMS.Affinities.adeptitude.tips.notAutomatic" }],
    },
    ineptitude: {
      color: colors.palette.red,
      identifier: "keyword:inept",
      img: images.manifest.keywords.inept,
      label: "TERIOCK.TERMS.Affinities.ineptitude.single",
      stacking: true,
      tips: [{ level: "warning", text: "TERIOCK.TERMS.Affinities.ineptitude.tips.notAutomatic" }],
    },
    incapability: {
      color: colors.palette.red,
      identifier: "keyword:incapable",
      img: images.manifest.keywords.incapable,
      label: "TERIOCK.TERMS.Affinities.incapability.single",
      tips: [{ level: "warning", text: "TERIOCK.TERMS.Affinities.incapability.tips.notAutomatic" }],
    },
  },
};

preLocalizeConfig("config.affinity.categories", { keys: ["label"] });
preLocalizeConfig("config.affinity.types", { key: "label", keys: ["label", "button"], sort: true });
