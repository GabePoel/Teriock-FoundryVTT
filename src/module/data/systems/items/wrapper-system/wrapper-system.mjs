import BaseItemSystem from "../base-item-system/base-item-system.mjs";

/**
 * Wrapper-specific item data model.
 * @extends {Teriock.Models.WrapperSystemInterface}
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
   * @returns {AnyActiveEffect}
   */
  get effect() {
    return this.parent.validEffects[0];
  }

  /** @inheritDoc */
  get panelParts() {
    return this.effect?.system.panelParts;
  }

  /** @inheritDoc */
  async use(options = {}) {
    return this.effect.use(options);
  }
}
