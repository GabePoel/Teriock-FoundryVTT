/**
 * Options that describe documents.
 * @type {Record<string, {name: string, icon: string, doc?: string}>}
 */
export const documentOptions = {
  ability: {
    doc: "ActiveEffect",
    getter: "abilities",
    icon: "hand-sparkles",
    name: "Ability",
    pack: "abilities",
  },
  attunement: {
    doc: "ActiveEffect",
    getter: "attunements",
    icon: "handshake",
    name: "Attunement",
  },
  body: {
    doc: "Item",
    getter: "bodyParts",
    icon: "boot",
    name: "Body Part",
    pack: "bodyParts",
  },
  character: {
    doc: "Actor",
    getter: "characters",
    icon: "user",
    name: "Character",
  },
  condition: {
    doc: "ActiveEffect",
    getter: "conditions",
    icon: "disease",
    name: "Condition",
  },
  consequence: {
    doc: "ActiveEffect",
    getter: "consequences",
    icon: "explosion",
    name: "Consequence",
  },
  creature: {
    doc: "Actor",
    getter: "creatures",
    icon: "octopus",
    name: "Creature",
    pack: "creatures",
  },
  effect: {
    doc: "ActiveEffect",
    getter: "effects",
    icon: "disease",
    name: "Effect",
  },
  equipment: {
    doc: "Item",
    getter: "equipment",
    icon: "treasure-chest",
    name: "Equipment",
    pack: "equipment",
  },
  fluency: {
    doc: "ActiveEffect",
    getter: "fluencies",
    icon: "compass-drafting",
    name: "Fluency",
  },
  mount: {
    doc: "Item",
    getter: "mounts",
    icon: "horse",
    name: "Mount",
  },
  power: {
    doc: "Item",
    getter: "powers",
    icon: "person-rays",
    name: "Power",
  },
  property: {
    doc: "ActiveEffect",
    getter: "properties",
    icon: "atom-simple",
    name: "Property",
    pack: "properties",
  },
  protection: {
    icon: "shield-halved",
    name: "Protection",
  },
  rank: {
    doc: "Item",
    getter: "ranks",
    icon: "wreath-laurel",
    name: "Rank",
    pack: "classes",
  },
  resource: {
    doc: "ActiveEffect",
    getter: "resources",
    icon: "hashtag",
    name: "Resource",
  },
  species: {
    doc: "Item",
    getter: "species",
    icon: "skull-cow",
    name: "Species",
    pack: "species",
  },
};
