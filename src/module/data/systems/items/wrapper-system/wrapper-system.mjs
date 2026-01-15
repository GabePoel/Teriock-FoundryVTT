import BaseItemSystem from "../base-item-system/base-item-system.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * Wrapper-specific item data model.
 * @implements {Teriock.Models.WrapperSystem}
 */
export default class WrapperSystem extends BaseItemSystem {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "wrapper",
      childEffectTypes: ["ability", "property", "resource", "fluency"],
    });
  }

  /**
   * The wrapped effect.
   * @returns {TeriockActiveEffect}
   */
  get effect() {
    return this.parent.validEffects[0];
  }

  /** @inheritDoc */
  get panelParts() {
    return this.effect?.system.panelParts;
  }
}
