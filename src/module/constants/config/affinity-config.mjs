import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { colors } from "../display/colors.mjs";

export default {
  categories: {
    abilities: {
      choices: "reference.abilities",
      format: "kebab",
      imgCategory: "abilities",
      label: "TYPES.ActiveEffect.ability",
      type: "ability",
    },
    bodyParts: {
      choices: "reference.bodyParts",
      format: "kebab",
      imgCategory: "bodyParts",
      label: "TYPES.Item.body",
      type: "body",
    },
    damageTypes: {
      choices: "reference.damageTypes",
      format: "kebab",
      imgCategory: "damageTypes",
      label: "TYPES.JournalEntryPage.damage",
      type: "damage",
    },
    drainTypes: {
      choices: "reference.drainTypes",
      format: "kebab",
      imgCategory: "drainTypes",
      label: "TYPES.JournalEntryPage.drain",
      type: "drain",
    },
    effectTypes: {
      choices: "reference.effectTypes",
      format: "camel",
      imgCategory: "effectTypes",
      label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.effectTypes.label",
    },
    elements: {
      choices: "reference.elements",
      format: "camel",
      imgCategory: "elements",
      label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.elements.label",
    },
    equipment: {
      choices: "reference.equipment",
      format: "kebab",
      imgCategory: "equipment",
      label: "TYPES.Item.equipment",
      type: "equipment",
    },
    powerSources: {
      choices: "reference.powerSources",
      format: "camel",
      imgCategory: "effectTypes",
      label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.powerSources.label",
    },
    properties: {
      choices: "reference.properties",
      format: "kebab",
      imgCategory: "properties",
      label: "TYPES.ActiveEffect.property",
      type: "property",
    },
    species: {
      choices: "reference.creatures",
      format: "kebab",
      imgCategory: "creatures",
      label: "TYPES.Item.species",
      type: "species",
    },
    statuses: {
      choices: "reference.conditions",
      format: "camel",
      imgCategory: "conditions",
      label: "TYPES.ActiveEffect.condition",
      type: "condition",
    },
    tradecrafts: {
      choices: "reference.tradecrafts",
      format: "camel",
      imgCategory: "tradecrafts",
      label: "TERIOCK.SHEETS.Actor.TABS.Tradecrafts.title",
    },

    other: { choices: "none", format: "none", imgCategory: "none", label: "TERIOCK.DIALOGS.Select.otherButton" },
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
  },
  // no sort
  types: {
    hexseal: {
      button: "TERIOCK.ROLLS.Hexseal.button",
      color: colors.palette.purple,
      hex: true,
      hook: "hexseal",
      identifier: "keyword:hexseal",
      imgCategory: "effectTypes",
      label: "TERIOCK.TERMS.Affinities.hexseal.single",
      protection: true,
    },
    immunity: {
      button: "TERIOCK.ROLLS.Immune.button",
      color: colors.palette.green,
      hook: "immune",
      identifier: "keyword:immunity",
      imgCategory: "effectTypes",
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
      imgCategory: "effectTypes",
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
      imgCategory: "effectTypes",
      label: "TERIOCK.TERMS.Affinities.resistance.single",
      protection: true,
      threshold: true,
    },
    vulnerability: {
      color: colors.palette.red,
      identifier: "keyword:vulnerability",
      imgCategory: "keywords",
      label: "TERIOCK.TERMS.Affinities.vulnerability.single",
      weakness: true,
    },
    takeBoost: {
      color: colors.palette.red,
      identifier: "keyword:boosted",
      imgCategory: "keywords",
      label: "TERIOCK.TERMS.Affinities.takeBoost.single",
      stacking: true,
    },
    takeDeboost: {
      color: colors.palette.green,
      identifier: "keyword:deboosted",
      imgCategory: "keywords",
      label: "TERIOCK.TERMS.Affinities.takeDeboost.single",
      stacking: true,
    },
    binding: {
      color: colors.palette.red,
      identifier: "condition:bound",
      imgCategory: "conditions",
      label: "TERIOCK.TERMS.Affinities.binding.single",
      weakness: true,
    },
  },
};

preLocalizeConfig("config.affinity.categories", { keys: ["label"] });
preLocalizeConfig("config.affinity.types", { keys: ["label", "button"] });
