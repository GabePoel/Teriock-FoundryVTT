/**
 * @import {CommonSystemMixin} from "./_module.mjs";
 */

/**
 * Mixin for systems that aren't common.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, UncommonSystem>}
 * @see {CommonSystemMixin}
 */
export default function UncommonSystemMixin(Base) {
  /** @mixin */
  class UncommonSystem extends Base {
    /** @inheritDoc */
    get actor() {
      return game.actors.default;
    }
  }

  return UncommonSystem;
}
