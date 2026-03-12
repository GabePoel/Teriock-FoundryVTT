import { ClientPseudoDocument } from "../abstract/_module.mjs";

const { BaseActiveEffect } = foundry.documents;

export default class PseudoActiveEffect extends ClientPseudoDocument {
  static get metadata() {
    return Object.assign(super.metadata, {
      collection: "effects",
      label: "DOCUMENT.Item",
      labelPlural: "DOCUMENT.ActiveEffects",
      name: "ActiveEffect",
    });
  }

  static defineSchema() {
    return Object.assign(super.defineSchema(), BaseActiveEffect.defineSchema());
  }
}
