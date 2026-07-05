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
      get _displayMessagesSuppression() {
        const messages = super._displayMessagesSuppression;
        if (this._isSuppressedArmor) { this._addSuppressionMessage("armor", messages); }
        return messages;
      }

      /**
       * If this is suppressed due to worn armor exceeding maximum AV.
       * @returns {boolean}
       */
      get _isSuppressedArmor() {
        return Boolean(
          game.settings.get("teriock", "armorSuppressesRanks")
            && this.actor
            && !this.innate
            && this.actor.system.defense.av.base > this.maxAv,
        );
      }

      /** @inheritDoc */
      get makeSuppressed() {
        return super.makeSuppressed || this._isSuppressedArmor;
      }
    }
  );
}
