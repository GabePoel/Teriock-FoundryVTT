import { icons } from "../display/icons.mjs";
import { documentConfig } from "./document-config.mjs";

export const wikiConfig = {
  namespaces: {
    Ability: {
      collection: null,
      icon: documentConfig.ability.icon,
      packs: ["teriock.abilities"],
      parentKey: "name",
      type: "ability",
    },
    Body: {
      collection: null,
      icon: documentConfig.body.icon,
      packs: ["teriock.bodyParts"],
      parentKey: "name",
      type: "body",
    },
    Class: {
      collection: "pages",
      icon: documentConfig.rank.icon,
      packs: ["teriock.rules"],
      parentKey: "namespace",
      type: "rank",
    },
    Condition: {
      collection: "pages",
      icon: documentConfig.condition.icon,
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
      icon: documentConfig.creature.icon,
      packs: ["teriock.creatures"],
      parentKey: "name",
      type: "creature",
    },
    Damage: {
      collection: "pages",
      icon: documentConfig.damage.icon,
      packs: ["teriock.rules"],
      parentKey: "namespace",
      type: "damage",
    },
    Drain: {
      collection: "pages",
      icon: documentConfig.drain.icon,
      packs: ["teriock.rules"],
      parentKey: "namespace",
      type: "drain",
    },
    Equipment: {
      collection: null,
      icon: documentConfig.equipment.icon,
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
      collection: null,
      icon: documentConfig.property.icon,
      packs: ["teriock.properties"],
      parentKey: "name",
      type: "property",
    },
    Tradecraft: {
      collection: "pages",
      icon: documentConfig.fluency.icon,
      packs: ["teriock.rules"],
      parentKey: "namespace",
      type: "text",
    },
  },
};
