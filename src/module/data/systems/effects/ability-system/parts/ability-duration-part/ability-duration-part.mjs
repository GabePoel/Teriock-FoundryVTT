import { parseDurationString } from "../../../../../../helpers/unit.mjs";
import { EvaluationField } from "../../../../../fields/_module.mjs";
import { DurationModel } from "../../../../../models/unit-models/_module.mjs";

/**
 * Ability duration part.
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {AbilitySystem}
     * @implements {AbilityDurationPartInterface}
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
      static migrateData(data) {
        // Duration migration
        if (typeof data.duration == "string") {
          data.duration = parseDurationString(data.duration);
        }
        if (["number", "string"].includes(typeof data.duration?.quantity)) {
          data.duration.raw = `${data.duration.quantity}`;
          delete data.duration.quantity;
        }
        if (data.duration?.unit === "untilDawn") {
          delete data.duration.unit;
          data.duration.dawn = true;
        }
        if (data.duration?.unit === "noLimit") {
          data.duration.unit = "unlimited";
        }
        super.migrateData(data);
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();

        // Clean passive durations
        if (this.maneuver === "passive") {
          this.duration.unit = "passive";
        }

        // Gifted modifications
        if (this.gifted.enabled) {
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
