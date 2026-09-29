import { DurationModel } from "../../../../../models/unit-models/_module.mjs";

const { fields } = foundry.data;

/**
 * Ability duration part.
 *
 * Relevant wiki pages:
 * - [Duration](https://wiki.teriock.com/index.php/Core:Duration)
 *
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function AbilityDurationPart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.AbilityDurationPartData}
   * @property {TeriockActiveEffect<"ability">} parent
   */
  class AbilityDurationPart
    extends /** @type {InitializedDataModel<T, Teriock.Models.AbilityDurationPartData>} */ (Base)
  {
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
