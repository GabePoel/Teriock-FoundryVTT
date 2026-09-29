const { fields } = foundry.data;

/**
 * Ability results part.
 *
 * Relevant wiki pages:
 * - [Interactions](https://wiki.teriock.com/index.php/Core:Interactions)
 *
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function AbilityResultsPart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.AbilityResultsPartData}
   * @property {TeriockActiveEffect<"ability">} parent
   */
  class AbilityResultsPart
    extends /** @type {InitializedDataModel<T, Teriock.Models.AbilityResultsPartData>} */ (Base)
  {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        results: new fields.SchemaField({
          critFail: new fields.HTMLField(),
          critHit: new fields.HTMLField(),
          critMiss: new fields.HTMLField(),
          critSave: new fields.HTMLField(),
          fail: new fields.HTMLField(),
          hit: new fields.HTMLField(),
          miss: new fields.HTMLField(),
          save: new fields.HTMLField(),
        }),
      });
    }
  }

  return AbilityResultsPart;
}
