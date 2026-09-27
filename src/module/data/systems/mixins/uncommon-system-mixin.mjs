/**
 * @import {CommonSystemMixin} from "./_module.mjs";
 */

/**
 * Mixin for systems that aren't common.
 * @template {MixinBase} T
 * @param {T} Base
 * @see {CommonSystemMixin}
 */
export default function UncommonSystemMixin(Base) {
  /** @mixin */
  class UncommonSystem extends Base {
    /** @inheritDoc */
    get actor() {
      return game.actors.default;
    }

    /** @inheritDoc */
    get isPassive() {
      return false;
    }
  }

  return UncommonSystem;
}
