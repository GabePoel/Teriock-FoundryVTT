/**
 * Mixin that enables suppression due to maximum armor value.
 *
 * Relevant wiki pages:
 * - [Armor Value](https://wiki.teriock.com/index.php/Core:Armor_Value)
 *
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function ArmorSuppressionSystemMixin(Base) {
  /** @mixin */
  class ArmorSuppressionSystem extends Base {
    /**
     * Documents whose competence was weakened by armor during this preparation.
     * @type {(TeriockActiveEffect|TeriockItem)[]}
     */
    #weakened = [];

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
      this.#weakened = [];
      if (
        game.settings.get("teriock", "armorWeakensRanks") && this.actor
        && this.actor.system.defense.av.base > this.maxAv
      ) {
        for (const d of [this.parent, ...this.parent.effects]) {
          if (d.system.lockedPaths?.has("system.competence.raw")) { continue; }
          foundry.utils.setProperty(d, "system.competence.raw", 0);
          this.#weakened.push(d);
        }
      }
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      for (const d of this.#weakened) {
        foundry.utils.setProperty(d.overrides, "system.competence.raw", 0);
      }
    }
  }

  return ArmorSuppressionSystem;
}
