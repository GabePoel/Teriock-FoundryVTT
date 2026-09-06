const { fields } = foundry.data;

/**
 * Ability results part.
 *
 * Relevant wiki pages:
 * - [Interactions](https://wiki.teriock.com/index.php/Core:Interactions)
 *
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, AbilityResultsPart & Teriock.Models.AbilityResultsPartData>}
 */
export default function AbilityResultsPart(Base) {
  /**
   * @implements {Teriock.Models.AbilityResultsPartData}
   * @mixin
   * @property {TeriockActiveEffect<"ability">} parent
   */
  class AbilityResultsPart extends Base {
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
