import { preLocalize } from "../../helpers/localization.mjs";
import { docSort, effectSort, rankSort } from "../../helpers/sort.mjs";
import { icons } from "../display/icons.mjs";

/**
 * Options that describe documents.
 * @type {Record<string, {doc?: string, name: string, icon: string, doc?: string, sorter?: Function, getter?: string}>}
 */
export const documentOptions = {
  ability: {
    doc: "ActiveEffect",
    getter: "abilities",
    icon: icons.document.ability,
    index: "abilities",
    name: "TYPES.ActiveEffect.ability",
    pack: "abilities",
    sorter: effectSort,
  },
  attunement: {
    doc: "ActiveEffect",
    getter: "attunements",
    icon: icons.document.attunement,
    name: "TYPES.ActiveEffect.attunement",
    sorter: docSort,
  },
  body: {
    doc: "Item",
    getter: "bodyParts",
    icon: icons.document.body,
    index: "bodyParts",
    name: "TYPES.Item.body",
    pack: "bodyParts",
    sorter: docSort,
  },
  character: {
    doc: "Actor",
    getter: "characters",
    icon: icons.document.character,
    name: "TYPES.Actor.character",
    sorter: docSort,
  },
  condition: {
    doc: "ActiveEffect",
    getter: "conditions",
    icon: icons.document.condition,
    index: "conditions",
    name: "TYPES.ActiveEffect.condition",
    sorter: docSort,
  },
  consequence: {
    doc: "ActiveEffect",
    getter: "consequences",
    icon: icons.document.consequence,
    name: "TYPES.ActiveEffect.consequence",
    sorter: docSort,
  },
  creature: {
    doc: "Actor",
    getter: "creatures",
    icon: icons.document.creature,
    name: "TYPES.Actor.creature",
    pack: "creatures",
    sorter: docSort,
  },
  damage: {
    doc: "JournalEntryPage",
    icon: icons.effect.damage,
  },
  drain: {
    doc: "JournalEntryPage",
    icon: icons.effect.drain,
  },
  effect: {
    doc: "ActiveEffect",
    getter: "effects",
    icon: icons.document.effect,
    name: "TYPES.ActiveEffect.effect",
    sorter: docSort,
  },
  equipment: {
    doc: "Item",
    getter: "equipment",
    icon: icons.document.equipment,
    index: "equipment",
    name: "TYPES.Item.equipment",
    pack: "equipment",
    sorter: docSort,
  },
  fluency: {
    doc: "ActiveEffect",
    getter: "fluencies",
    icon: icons.document.fluency,
    name: "TYPES.ActiveEffect.fluency",
    sorter: docSort,
  },
  mount: {
    doc: "Item",
    getter: "mounts",
    icon: icons.document.mount,
    name: "TYPES.Item.mount",
    sorter: docSort,
  },
  power: {
    doc: "Item",
    getter: "powers",
    icon: icons.document.power,
    name: "TYPES.Item.power",
    sorter: docSort,
  },
  property: {
    doc: "ActiveEffect",
    getter: "properties",
    icon: icons.document.property,
    index: "properties",
    name: "TYPES.ActiveEffect.property",
    pack: "properties",
    sorter: effectSort,
  },
  rank: {
    doc: "Item",
    getter: "ranks",
    icon: icons.document.rank,
    index: "classes",
    name: "TYPES.Item.rank",
    pack: "classes",
    sorter: rankSort,
  },
  resource: {
    doc: "ActiveEffect",
    getter: "resources",
    icon: icons.document.resource,
    name: "TYPES.ActiveEffect.resource",
    sorter: docSort,
  },
  species: {
    doc: "Item",
    getter: "species",
    icon: icons.document.species,
    index: "creatures",
    name: "TYPES.Item.species",
    pack: "species",
    sorter: docSort,
  },
  stone: {
    doc: "Card",
    icon: icons.document.stone,
    name: "TYPES.Card.stone",
  },
  wrapper: {
    doc: "Item",
    icon: icons.document.ability,
    name: "TYPES.Item.wrapper",
  },
};

preLocalize("options.document", { keys: ["name"] });
