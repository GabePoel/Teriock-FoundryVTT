import { toId } from "../../../../../../helpers/string.mjs";
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
export default function AbilityDurationPart(Base) {
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

      /** @inheritDoc */
      static migrateData(source, options, state) {
        // Moving all trigger and condition related fields out of duration into expirations and qualifiers.
        if (!source.expirations) { source.expirations = {}; }
        if (source.duration?.triggers) {
          const triggers = source.duration.triggers;
          delete source.duration.triggers;
          if (triggers.length) {
            const id = toId("triggers", { hash: true });
            source.expirations[id] = { _id: id, triggers, type: "trigger" };
          }
        }
        if (source.duration?.conditions) {
          const conditions = source.duration.conditions;
          delete source.duration.conditions;
          if (conditions.present?.length || conditions.absent?.length) {
            if (source.maneuver === "passive") {
              for (const automation of Object.values(source.automations ?? {})) {
                if (
                  (!automation?.activeQualifier || automation?.activeQualifier === "1") && automation?.type !== "resist"
                ) {
                  const pieces = [
                    ...(conditions.present ?? []).map((c) => `@status.${c}`),
                    ...(conditions.absent ?? []).map((c) => `not(@status.${c})`),
                  ];
                  if (pieces.length === 1) { automation.activeQualifier = pieces[0]; }
                  else if (pieces.length) { automation.activeQualifier = `and(${pieces.join(", ")})`; }
                }
              }
            } else {
              const id = toId("conditions", { hash: true });
              source.expirations[id] = {
                _id: id,
                statuses: { absent: conditions.present, present: conditions.absent },
                type: "status",
              };
            }
          }
        }
        if (source.duration?.description) { delete source.duration.description; }
        return super.migrateData(source, options, state);
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
          }
        }
      }
    }
  );
}
