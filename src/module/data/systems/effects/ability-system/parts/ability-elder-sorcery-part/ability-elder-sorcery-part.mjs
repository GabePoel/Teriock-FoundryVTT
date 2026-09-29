const { fields } = foundry.data;

/**
 * Ability Elder Sorcery part.
 *
 * Relevant wiki pages:
 * - [Elder Sorcery](https://wiki.teriock.com/index.php/Core:Elder_Sorcery)
 *
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function AbilityElderSorceryPart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.AbilityElderSorceryPartData}
   * @property {TeriockActiveEffect<"ability">} parent
   */
  class AbilityElderSorceryPart
    extends /** @type {InitializedDataModel<T, Teriock.Models.AbilityElderSorceryPartData>} */ (Base)
  {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        elderSorcery: new fields.BooleanField(),
        elderSorceryIncant: new fields.HTMLField(),
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
