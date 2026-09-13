import { toId } from "../../helpers/string.mjs";
import TypeCollection from "./type-collection.mjs";

/**
 * A subclass of TypeCollection designed to handle multiple document classes at the same time.
 */
export default class ChildCollection extends TypeCollection {
  /** @inheritdoc */
  static get metadata() {
    return Object.assign(super.metadata, { validate: true });
  }

  /**
   * A new set of deterministically generated IDs are used because the contents of this may come from different
   * Collections. Otherwise, we technically have a risk of collisions.
   * @inheritDoc
   */
  _toEntry(document) {
    return [toId(document?.uuid ?? document?._id, { hash: true }) ?? document?._id, document];
  }

  /** @inheritDoc */
  _validateDocument(document) {
    return foundry.utils.getProperty(document, "system._sup") === this.model?.id || document?.master === this.model
      || document?.master?.master === this.model || document?.parent === this.model
      || document?.parent?.parent === this.model || document?.system?.isBasic;
  }
}
