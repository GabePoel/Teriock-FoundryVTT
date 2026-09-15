import { mergeMetadata } from "../../helpers/construction.mjs";
import TypeCollection from "./type-collection.mjs";

/**
 * A collection of subs for a sup that validate that all the subs are still correct.
 * @see {HierarchyDocumentMixin}
 * @category Hierarchy
 */
export default class SubCollection extends TypeCollection {
  /** @inheritdoc */
  static metadata = mergeMetadata(super.metadata, { validate: true });

  /** @inheritDoc */
  _validateDocument(document) {
    return foundry.utils.getProperty(document, "system._sup") === this.model?.id;
  }
}
