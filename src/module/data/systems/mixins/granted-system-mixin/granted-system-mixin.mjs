const { fields } = foundry.data;

/**
 * Data mixin to support equipment suppression configuration.
 * @param {typeof BaseEffectSystem} Base
 */
export default function GrantedSystemMixin(Base) {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @extends {Teriock.Models.GrantedSystemData}
     * @mixin
     */
    class GrantedSystem extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.SYSTEMS.Granted",
      ];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          applyIfDampened: new fields.BooleanField(),
          applyIfShattered: new fields.BooleanField(),
          applyIfUnequipped: new fields.BooleanField({ initial: true }),
        });
      }

      /** @inheritDoc */
      get _isSuppressedDampened() {
        return !this.applyIfDampened && super._isSuppressedDampened;
      }

      /** @inheritDoc */
      get _isSuppressedShattered() {
        return !this.applyIfShattered && super._isSuppressedShattered;
      }

      /** @inheritDoc */
      get _isSuppressedUnequipped() {
        return !this.applyIfUnequipped && super._isSuppressedUnequipped;
      }
    }
  );
}
