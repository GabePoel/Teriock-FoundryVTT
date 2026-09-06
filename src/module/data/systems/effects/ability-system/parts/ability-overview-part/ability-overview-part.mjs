const { fields } = foundry.data;

/**
 * Ability overview part.
 *
 * Relevant wiki pages:
 * - [Competence](https://wiki.teriock.com/index.php/Core:Competence)
 * - [Heightening](https://wiki.teriock.com/index.php/Core:Heightening)
 * - [Improved](https://wiki.teriock.com/index.php/Keyword:Improved)
 * - [Limited](https://wiki.teriock.com/index.php/Keyword:Limited)
 *
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, AbilityOverviewPart & Teriock.Models.AbilityOverviewPartData>}
 */
export default function AbilityOverviewPart(Base) {
  /**
   * @implements {Teriock.Models.AbilityOverviewPartData}
   * @mixin
   * @property {TeriockActiveEffect<"ability">} parent
   */
  class AbilityOverviewPart extends Base {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        endCondition: new fields.HTMLField(),
        heightened: new fields.HTMLField(),
        improvement: new fields.HTMLField(),
        limitation: new fields.HTMLField(),
        overview: new fields.SchemaField({
          base: new fields.HTMLField(),
          fluent: new fields.HTMLField(),
          proficient: new fields.HTMLField(),
        }),
        requirements: new fields.HTMLField(),
        trigger: new fields.HTMLField(),
      });
    }
  }

  return AbilityOverviewPart;
}
