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
        const forced = { "system.kind": "gifted" };
        if (this.maneuver === "passive") {
          Object.assign(forced, {
            "system.duration.raw": "1",
            "system.duration.unit": "minute",
            "system.executionTime.base": "a1",
            "system.maneuver": "active",
          });
        }
        for (const [path, value] of Object.entries(forced)) {
          if (this.lockedPaths.has(path)) { continue; }
          foundry.utils.setProperty(this.parent, path, value);
          foundry.utils.setProperty(this.parent.overrides, path, value);
        }
      }
    }
  }

  return AbilityDurationPart;
}
