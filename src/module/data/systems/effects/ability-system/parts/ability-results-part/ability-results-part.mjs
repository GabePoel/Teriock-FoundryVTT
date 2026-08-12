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
   * @property {TeriockAbility} parent
   */
  class AbilityResultsPart extends Base {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        results: new fields.SchemaField({
          critFail: new fields.HTMLField({ initial: "" }),
          critHit: new fields.HTMLField({ initial: "" }),
          critMiss: new fields.HTMLField({ initial: "" }),
          critSave: new fields.HTMLField({ initial: "" }),
          fail: new fields.HTMLField({ initial: "" }),
          hit: new fields.HTMLField({ initial: "" }),
          miss: new fields.HTMLField({ initial: "" }),
          save: new fields.HTMLField({ initial: "" }),
        }),
      });
    }
  }

  return AbilityResultsPart;
}
