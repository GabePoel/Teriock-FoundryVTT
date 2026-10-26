import { preLocalizeObject } from "../../helpers/localization.mjs";

/** @enum {Teriock.Config.CategoryEntry} */
const categoryConfig = {
  ability: { label: "TYPES.ActiveEffect.ability", suggestions: "registry" },
  body: { label: "TYPES.Item.body", suggestions: "registry" },
  class: { label: "TYPES.JournalEntryPage.class", suggestions: "registry" },
  classification: {
    label: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentClasses.label",
    suggestions: "CONFIG.equipment.equipmentClasses",
  },
  condition: { label: "TYPES.ActiveEffect.condition", suggestions: "registry" },
  damage: { label: "TYPES.JournalEntryPage.damage", suggestions: "registry" },
  drain: { label: "TYPES.JournalEntryPage.drain", suggestions: "registry" },
  effect: {
    label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.effectTypes.label",
    suggestions: "CONFIG.metaphysics.effectTypes",
  },
  element: { label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.elements.label", suggestions: "CONFIG.metaphysics.elements" },
  equipment: { label: "TYPES.Item.equipment", suggestions: "registry" },
  property: { label: "TYPES.ActiveEffect.property", suggestions: "registry" },
  source: {
    label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.powerSources.label",
    suggestions: "CONFIG.metaphysics.powerSources",
  },
  species: { imgCategory: "creature", label: "TYPES.Item.species", suggestions: "registry" },
  style: { label: "TYPES.JournalEntryPage.style", suggestions: "registry" },
  tradecraft: { label: "TERIOCK.SHEETS.Actor.TABS.Tradecrafts.title", suggestions: "registry" },

  other: { format: "none", label: "TERIOCK.COMMON.Other", suggestions: "none" },
};

export default categoryConfig;

preLocalizeObject("CONFIG.category", { keys: ["label"] });
