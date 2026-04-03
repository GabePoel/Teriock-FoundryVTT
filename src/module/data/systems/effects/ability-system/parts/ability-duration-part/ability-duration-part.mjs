import { EvaluationField } from "../../../../../fields/_module.mjs";
import { DurationModel } from "../../../../../models/unit-models/_module.mjs";

/**
 * Ability duration part.
 *
 * Relevant wiki pages:
 * - [Duration](https://wiki.teriock.com/index.php/Core:Duration)
 *
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseEffectSystem}
     * @extends {Teriock.Models.AbilityDurationPartData}
     * @mixin
     */
    class AbilityDurationPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          duration: new EvaluationField({ model: DurationModel }),
        });
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();

        // Clean passive durations
        if (this.maneuver === "passive") {
          this.duration.unit = "passive";
        }

        // Gifted modifications
        if (this.costs.tweaks.gifted) {
          this.form = "gifted";
          if (this.maneuver === "passive") {
            this.maneuver = "active";
            this.executionTime = "a1";
            this.duration.unit = "minute";
            this.duration.raw = "1";
            delete this.duration.description;
          }
        }
      }
    }
  );
};
