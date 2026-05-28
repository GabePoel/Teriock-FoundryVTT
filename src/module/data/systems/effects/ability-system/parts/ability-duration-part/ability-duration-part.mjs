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
export default Base => {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @extends {Teriock.Models.AbilityDurationPartData}
     * @mixin
     */
    class AbilityDurationPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), { duration: new EvaluationField({ model: DurationModel }) });
      }

      /**
       * If this is suppressed due to its actor's conditions.
       * @returns {boolean}
       */
      get _isSuppressedConditions() {
        if (this.maneuver === "passive" && this.actor) {
          for (
            const condition of this.duration.conditions.present
          ) { if (!this.actor.statuses.has(condition)) { return true; } }
          for (
            const condition of this.duration.conditions.absent
          ) { if (this.actor.statuses.has(condition)) { return true; } }
        }
        return false;
      }

      /** @inheritDoc */
      get makeSuppressed() {
        return super.makeSuppressed || this._isSuppressedConditions;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();

        // Clean passive durations
        if (this.maneuver === "passive") { this.duration.unit = "passive"; }

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
