import TypeCollection from "./type-collection.mjs";

/**
 * A collection of subs for a sup that validate that all the subs are still correct.
 * @see {HierarchyDocumentMixin}
 */
export default class SubCollection extends TypeCollection {
  /** @inheritDoc */
  _validateDocument(document) {
    return foundry.utils.getProperty(document, "system._sup") === this.model?.id;
  }
}
