import { preLocalize } from "../../helpers/localization.mjs";

export const documentTypes = {
  actors: {
    character: "TYPES.Actor.character",
    creature: "TYPES.Actor.creature",
  },
  effects: {
    ability: "TYPES.ActiveEffect.ability",
    attunement: "TYPES.ActiveEffect.attunement",
    base: "TYPES.ActiveEffect.effect",
    condition: "TYPES.ActiveEffect.condition",
    consequence: "TYPES.ActiveEffect.consequence",
    fluency: "TYPES.ActiveEffect.fluency",
    property: "TYPES.ActiveEffect.property",
    resource: "TYPES.ActiveEffect.resource",
  },
  items: {
    body: "TYPES.Item.body",
    mount: "TYPES.Item.mount",
    equipment: "TYPES.Item.equipment",
    power: "TYPES.Item.power",
    rank: "TYPES.Item.rank",
    species: "TYPES.Item.species",
    wrapper: "TYPES.Item.wrapper",
  },
  macros: {
    chat: "TYPES.Macro.chat",
    script: "TYPES.Macro.script",
  },
  card: {
    stone: "TYPES.Card.stone",
    card: "TYPES.Card.card",
  },
};

preLocalize("TERIOCK.system.documentTypes.items");
preLocalize("TERIOCK.system.documentTypes.effects");
preLocalize("TERIOCK.system.documentTypes.effects.actors");
preLocalize("TERIOCK.system.documentTypes.macros");
