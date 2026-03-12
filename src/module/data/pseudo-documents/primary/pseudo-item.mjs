import { ClientPseudoDocument } from "../abstract/_module.mjs";

const { BaseItem } = foundry.documents;

export default class PseudoItem extends ClientPseudoDocument {
  static get metadata() {
    return Object.assign(super.metadata, {
      collection: "items",
      label: "DOCUMENT.Item",
      labelPlural: "DOCUMENT.Items",
      name: "Item",
    });
  }

  static defineSchema() {
    return Object.assign(super.defineSchema(), BaseItem.defineSchema());
  }
}
