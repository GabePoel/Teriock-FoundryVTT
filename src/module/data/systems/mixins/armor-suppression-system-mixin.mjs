/**
 * @param {typeof ChildSystem} Base
 */
export default function ArmorSuppressionSystemMixin(Base) {
  return (
    /**
     * @extends {ChildSystem}
     * @mixin
     */
    class ArmorSuppressionSystem extends Base {
      /** @inheritDoc */
      _getTipSuppressions() {
        return Object.assign(super._getTipSuppressions(), { armor: this._isSuppressedArmor.bind(this) });
      }

      /**
       * If this is suppressed due to worn armor exceeding maximum AV.
       * @returns {boolean}
       */
      _isSuppressedArmor() {
        return Boolean(
          game.settings.get("teriock", "armorSuppressesRanks")
            && this.actor
            && !this.innate
            && this.actor.system.defense.av.base > this.maxAv,
        );
      }
    }
  );
}
