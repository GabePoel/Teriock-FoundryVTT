import { DurationModel } from "../../../../../models/unit-models/_module.mjs";

const { fields } = foundry.data;

/**
 * Ability duration part.
 *
 * Relevant wiki pages:
 * - [Duration](https://wiki.teriock.com/index.php/Core:Duration)
 *
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, AbilityDurationPart & Teriock.Models.AbilityDurationPartData>}
 */
export default function AbilityDurationPart(Base) {
  /**
   * @implements {Teriock.Models.AbilityDurationPartData}
   * @mixin
   * @property {TeriockActiveEffect<"ability">} parent
   */
  class AbilityDurationPart extends Base {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { duration: new fields.EmbeddedDataField(DurationModel) });
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();

      // Clean passive durations
      if (this.maneuver === "passive") { this.duration.unit = "passive"; }

      // Gifted modifications
      if (this.costs.tweaks.gifted) {
        this.kind = "gifted";
        if (this.maneuver === "passive") {
          this.maneuver = "active";
          this.executionTime = "a1";
          this.duration.unit = "minute";
          this.duration.raw = "1";
        }
      }
    }
  }

  return AbilityDurationPart;
}
