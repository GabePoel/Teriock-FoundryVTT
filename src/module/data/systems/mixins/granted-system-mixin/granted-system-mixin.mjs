const { fields } = foundry.data;

/**
 * Data mixin to support equipment suppression configuration.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, GrantedSystem & Teriock.Models.GrantedSystemData>}
 */
export default function GrantedSystemMixin(Base) {
  /**
   * @implements {Teriock.Models.GrantedSystemData}
   * @mixin
   */
  class GrantedSystem extends Base {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Granted"];

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        applyIfDampened: new fields.BooleanField(),
        applyIfDestroyed: new fields.BooleanField(),
        applyIfShattered: new fields.BooleanField(),
        applyIfUnequipped: new fields.BooleanField({ initial: true }),
      });
    }

    /** @inheritDoc */
    _isSuppressedDampened() {
      return !this.applyIfDampened && super._isSuppressedDampened();
    }

    /** @inheritDoc */
    _isSuppressedDestroyed() {
      return !this.applyIfDestroyed && super._isSuppressedDestroyed();
    }

    /** @inheritDoc */
    _isSuppressedShattered() {
      return !this.applyIfShattered && super._isSuppressedShattered();
    }

    /** @inheritDoc */
    _isSuppressedUnequipped() {
      return !this.applyIfUnequipped && super._isSuppressedUnequipped();
    }
  }

  return GrantedSystem;
}
