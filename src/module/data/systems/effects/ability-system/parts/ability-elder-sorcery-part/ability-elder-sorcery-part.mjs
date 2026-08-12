const { fields } = foundry.data;

/**
 * Ability Elder Sorcery part.
 *
 * Relevant wiki pages:
 * - [Elder Sorcery](https://wiki.teriock.com/index.php/Core:Elder_Sorcery)
 *
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, AbilityElderSorceryPart & Teriock.Models.AbilityElderSorceryPartData>}
 */
export default function AbilityElderSorceryPart(Base) {
  /**
   * @implements {Teriock.Models.AbilityElderSorceryPartData}
   * @mixin
   * @property {TeriockActiveEffect<"ability">} parent
   */
  class AbilityElderSorceryPart extends Base {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        elderSorcery: new fields.BooleanField({ initial: false }),
        elderSorceryIncant: new fields.HTMLField({ initial: "" }),
      });
    }

    /** @inheritDoc */
    get _metaphysicsTags() {
      const tags = super._metaphysicsTags;
      if (this.warded) { tags.push("TERIOCK.SYSTEMS.Attack.FIELDS.warded.label"); }
      if (this.elderSorcery) { tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.elderSorcery.label"); }
      return tags;
    }

    /** @inheritDoc */
    getLocalRollData() {
      return Object.assign(super.getLocalRollData(), { es: Number(this.elderSorcery) });
    }
  }

  return AbilityElderSorceryPart;
}
