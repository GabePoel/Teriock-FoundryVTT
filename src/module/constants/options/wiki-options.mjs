import { icons } from "../display/icons.mjs";
import { documentOptions } from "./document-options.mjs";

export const wikiOptions = {
  namespaces: {
    Ability: {
      collection: "effects",
      icon: documentOptions.ability.icon,
      packs: ["teriock.abilities"],
      parentKey: "name",
      type: "ability",
    },
    Body: {
      collection: null,
      icon: documentOptions.body.icon,
      packs: ["teriock.bodyParts"],
      parentKey: "name",
      type: "body",
    },
    Class: {
      collection: "pages",
      icon: documentOptions.rank.icon,
      packs: ["teriock.rules"],
      parentKey: "namespace",
      type: "rank",
    },
    Condition: {
      collection: "pages",
      icon: documentOptions.condition.icon,
      packs: ["teriock.rules"],
      parentKey: "namespace",
      type: "text",
    },
    Core: {
      collection: "pages",
      icon: icons.document.core,
      packs: ["teriock.rules"],
      parentKey: "namespace",
      type: "text",
    },
    Creature: {
      collection: null,
      icon: documentOptions.creature.icon,
      packs: ["teriock.creatures"],
      parentKey: "name",
      type: "creature",
    },
    Damage: {
      collection: "pages",
      icon: documentOptions.damage.icon,
      packs: ["teriock.rules"],
      parentKey: "namespace",
      type: "damage",
    },
    Drain: {
      collection: "pages",
      icon: documentOptions.drain.icon,
      packs: ["teriock.rules"],
      parentKey: "namespace",
      type: "drain",
    },
    Equipment: {
      collection: null,
      icon: documentOptions.equipment.icon,
      packs: ["teriock.equipment"],
      parentKey: "name",
      type: "equipment",
    },
    Keyword: {
      collection: "pages",
      icon: icons.document.keyword,
      packs: ["teriock.rules"],
      parentKey: "namespace",
      type: "text",
    },
    Property: {
      collection: "effects",
      icon: documentOptions.property.icon,
      packs: ["teriock.abilities"],
      parentKey: "name",
      type: "property",
    },
    Tradecraft: {
      collection: "pages",
      icon: documentOptions.fluency.icon,
      packs: ["teriock.rules"],
      parentKey: "namespace",
      type: "text",
    },
  },
};
