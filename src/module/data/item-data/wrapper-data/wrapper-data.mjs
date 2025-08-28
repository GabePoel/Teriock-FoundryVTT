import { mergeFreeze } from "../../../helpers/utils.mjs";
import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";

/**
 * Wrapper-specific item data model.
 */
export default class TeriockWrapperData extends TeriockBaseItemData {
  /**
   * @inheritDoc
   * @type {Readonly<Teriock.Documents.ItemModelMetadata>}
   */
  static metadata = mergeFreeze(super.metadata, {
    type: "wrapper",
    childEffectTypes: ["ability", "property", "resource", "fluency"],
  });

  /**
   * The wrapped effect.
   * @returns {TeriockEffect}
   */
  get effect() {
    return this.parent.effects.getName(this.parent.name);
  }
}
