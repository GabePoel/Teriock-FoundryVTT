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
   * @property {TeriockAbility} parent
   */
  class AbilityOverviewPart extends Base {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        endCondition: new fields.HTMLField({ initial: "" }),
        heightened: new fields.HTMLField({ initial: "" }),
        improvement: new fields.HTMLField({ initial: "" }),
        limitation: new fields.HTMLField({ initial: "" }),
        overview: new fields.SchemaField({
          base: new fields.HTMLField({ initial: "" }),
          fluent: new fields.HTMLField({ initial: "" }),
          proficient: new fields.HTMLField({ initial: "" }),
        }),
        requirements: new fields.HTMLField({ initial: "" }),
        trigger: new fields.HTMLField({ initial: "" }),
      });
    }
  }

  return AbilityOverviewPart;
}
