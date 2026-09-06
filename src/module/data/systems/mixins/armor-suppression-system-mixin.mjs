/**
 * Mixin that enables suppression due to maximum armor value.
 *
 * Relevant wiki pages:
 * - [Armor Value](https://wiki.teriock.com/index.php/Core:Armor_Value)
 *
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ArmorSuppressionSystem>}
 */
export default function ArmorSuppressionSystemMixin(Base) {
  /** @mixin */
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

    /** @inheritDoc */
    getLocalRollData() {
      return Object.assign(super.getLocalRollData(), { maxAv: this.maxAv });
    }

    /** @inheritDoc */
    prepareBaseData() {
      super.prepareBaseData();
      if (
        game.settings.get("teriock", "armorWeakensRanks") && this.actor
        && this.actor.system.defense.av.base > this.maxAv
      ) {
        this.competence.raw = 0;
        for (const e of this.parent.effects) { foundry.utils.setProperty(e, "system.competence.raw", 0); }
      }
    }
  }

  return ArmorSuppressionSystem;
}
