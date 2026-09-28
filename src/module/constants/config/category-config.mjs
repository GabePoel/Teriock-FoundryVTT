import { preLocalizeConfig } from "../../helpers/localization.mjs";

/** @enum {Teriock.Config.CategoryEntry} */
const categoryConfig = {
  ability: { label: "TYPES.ActiveEffect.ability", suggestions: "registry" },
  body: { label: "TYPES.Item.body", suggestions: "registry" },
  class: { label: "TYPES.JournalEntryPage.class", suggestions: "registry" },
  classification: {
    label: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentClasses.label",
    suggestions: "config.equipment.equipmentClasses",
  },
  condition: { label: "TYPES.ActiveEffect.condition", suggestions: "registry" },
  damage: { label: "TYPES.JournalEntryPage.damage", suggestions: "registry" },
  drain: { label: "TYPES.JournalEntryPage.drain", suggestions: "registry" },
  effect: {
    label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.effectTypes.label",
    suggestions: "config.metaphysics.effectTypes",
  },
  element: { label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.elements.label", suggestions: "config.metaphysics.elements" },
  equipment: { label: "TYPES.Item.equipment", suggestions: "registry" },
  property: { label: "TYPES.ActiveEffect.property", suggestions: "registry" },
  source: {
    label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.powerSources.label",
    suggestions: "config.metaphysics.powerSources",
  },
  species: { imgCategory: "creature", label: "TYPES.Item.species", suggestions: "registry" },
  style: { label: "TYPES.JournalEntryPage.style", suggestions: "registry" },
  tradecraft: { label: "TERIOCK.SHEETS.Actor.TABS.Tradecrafts.title", suggestions: "registry" },

  other: { format: "none", label: "TERIOCK.COMMON.Other", suggestions: "none" },
};

export default categoryConfig;

preLocalizeConfig("config.category", { keys: ["label"] });
