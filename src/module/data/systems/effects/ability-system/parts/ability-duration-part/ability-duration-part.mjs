import { parseDurationString } from "../../../../../../helpers/unit.mjs";
import { EvaluationField } from "../../../../../fields/_module.mjs";
import { DurationModel } from "../../../../../models/unit-models/_module.mjs";

const { getProperty, setProperty, deleteProperty } = foundry.utils;

/**
 * Ability duration part.
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseEffectSystem}
     * @extends {Teriock.Models.AbilityDurationPartInterface}
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
        if (
          ["number", "string"].includes(
            typeof getProperty(data, "duration.quantity"),
          )
        ) {
          setProperty(
            data,
            "duration.raw",
            getProperty(data, "duration.quantity").toString(),
          );
          deleteProperty(data, "duration.quantity");
        }
        if (getProperty(data, "duration.unit") === "untilDawn") {
          deleteProperty(data, "duration.unit");
          setProperty(data, "duration.dawn", true);
        }
        if (getProperty(data, "duration.unit") === "noLimit") {
          setProperty(data, "duration.unit", "unlimited");
        }
        return super.migrateData(data);
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
