import { preLocalize } from "../../helpers/localization.mjs";

export const protectionOptions = {
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
      label: "TERIOCK.SYSTEMS.Ability.FIELDS.effectTypes.label",
    },
    elements: {
      choices: "reference.elements",
      format: "camel",
      imgCategory: "elements",
      label: "TERIOCK.SYSTEMS.Ability.FIELDS.elements.label",
    },
    equipment: {
      choices: "reference.equipment",
      format: "kebab",
      imgCategory: "equipment",
      label: "TYPES.Item.equipment",
      type: "equipment",
    },
    other: {
      choices: "none",
      format: "none",
      imgCategory: "none",
      label: "TERIOCK.DIALOGS.Select.otherButton",
    },
    powerSources: {
      choices: "reference.powerSources",
      format: "camel",
      imgCategory: "effectTypes",
      label: "TERIOCK.SYSTEMS.Ability.FIELDS.powerSources.label",
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
  },
  types: {
    resistances: {
      action: "rollResistance",
      button: "TERIOCK.ROLLS.Resist.button",
      label: "TERIOCK.TERMS.Protections.resistance.single",
      rule: "Resistance",
    },
    hexproofs: {
      action: "rollHexproof",
      button: "TERIOCK.ROLLS.Hexproof.button",
      label: "TERIOCK.TERMS.Protections.hexproof.single",
      rule: "Hexproof",
    },
    immunities: {
      action: "rollImmunity",
      button: "TERIOCK.ROLLS.Immune.button",
      label: "TERIOCK.TERMS.Protections.immunity.single",
      rule: "Immunity",
    },
    hexseals: {
      action: "rollHexseal",
      button: "TERIOCK.ROLLS.Hexseal.button",
      label: "TERIOCK.TERMS.Protections.hexseal.single",
      rule: "Hexseal",
    },
  },
};

preLocalize("options.protection.categories", { keys: ["label"] });
preLocalize("options.protection.types", { keys: ["label", "button"] });
