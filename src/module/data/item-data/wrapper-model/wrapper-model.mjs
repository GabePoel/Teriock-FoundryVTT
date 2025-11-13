import { mergeMetadata } from "../../../helpers/utils.mjs";
import TeriockBaseItemModel from "../base-item-model/base-item-model.mjs";

/**
 * Wrapper-specific item data model.
 */
export default class TeriockWrapperModel extends TeriockBaseItemModel {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    type: "wrapper",
    childEffectTypes: ["ability", "property", "resource", "fluency"],
  });

  /**
   * The wrapped effect.
   * @returns {TeriockEffect}
   */
  get effect() {
    return this.parent.validEffects[0];
  }

  /** @inheritDoc */
  get messageParts() {
    return this.effect.system.messageParts;
  }
}
