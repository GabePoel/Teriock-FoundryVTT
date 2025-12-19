import TeriockBaseItemModel from "../base-item-model/base-item-model.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * Wrapper-specific item data model.
 * @implements {Teriock.Models.TeriockWrapperModelInterface}
 */
export default class TeriockWrapperModel extends TeriockBaseItemModel {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "wrapper",
      childEffectTypes: ["ability", "property", "resource", "fluency"],
    });
  }

  /**
   * The wrapped effect.
   * @returns {TeriockEffect}
   */
  get effect() {
    return this.parent.validEffects[0];
  }

  /** @inheritDoc */
  get panelParts() {
    return this.effect.system.panelParts;
  }
}
