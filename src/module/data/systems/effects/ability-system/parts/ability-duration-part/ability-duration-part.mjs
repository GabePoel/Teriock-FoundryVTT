import { parseDurationString } from "../../../../../../helpers/unit.mjs";

const { fields } = foundry.data;

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
        const schema = super.defineSchema();
        Object.assign(schema, {
          duration: new fields.SchemaField({
            unit: new fields.StringField({
              choices: TERIOCK.options.ability.duration.unit,
              initial: "minute",
              label: "Unit",
              hint: "Unit of time for this ability's duration.",
            }),
            quantity: new fields.NumberField({
              initial: 1,
              min: 0,
              label: "Quantity",
              hint:
                'How many of the aforementioned unit should this unit be active for? Irrelevant for "Instant" and ' +
                '"No Limit" units.',
            }),
            conditions: new fields.SchemaField({
              present: new fields.SetField(
                new fields.StringField({ choices: TERIOCK.index.conditions }),
                {
                  label: "Present Conditions",
                  hint: "What conditions must be present in order for this ability to be active?",
                },
              ),
              absent: new fields.SetField(
                new fields.StringField({ choices: TERIOCK.index.conditions }),
                {
                  label: "Absent Conditions",
                  hint: "What conditions must be absent in order for this ability to be active?",
                },
              ),
            }),
            stationary: new fields.BooleanField({
              label: "Stationary",
              hint: "Do you need to be stationary for this ability to be active?",
            }),
            description: new fields.StringField({
              label: "Description",
              hint: "Custom description. Leave blank in order for the duration to be automatically generated.",
              initial: "1 Minute",
            }),
          }),
        });
        return schema;
      }

      /** @inheritDoc */
      static migrateData(data) {
        // Duration migration
        if (typeof data.duration == "string") {
          data.duration = parseDurationString(data.duration);
        }
        super.migrateData(data);
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        // Gifted modifications
        if (this.gifted.enabled) {
          this.form = "gifted";
          if (this.maneuver === "passive") {
            this.maneuver = "active";
            this.executionTime = "a1";
            this.duration.unit = "minute";
            this.duration.quantity = 1;
            this.duration.description = "1 Minute";
          }
        }
        let baseDuration = 0;
        if (Object.keys(FINITE_UNITS).includes(this.duration.unit)) {
          baseDuration =
            FINITE_UNITS[this.duration.unit] * this.duration.quantity;
        }
        this.impacts.base.duration = baseDuration;

        // Compute changes
        let applyChanges = this.maneuver === "passive";
        for (const status of this.duration.conditions.present) {
          if (!this.actor?.statuses.has(status)) {
            applyChanges = false;
          }
        }
        for (const status of this.duration.conditions.absent) {
          if (this.actor?.statuses.has(status)) {
            applyChanges = false;
          }
        }
        if (applyChanges) {
          this.parent.changes = this.changes;
        }
      }
    }
  );
};

const FINITE_UNITS = {
  instant: 0,
  second: 1,
  minute: 60,
  hour: 60 * 60,
  day: 60 * 60 * 24,
  week: 60 * 60 * 24 * 7,
  month: (60 * 60 * 24 * 365) / 12,
  year: 60 * 60 * 24 * 365,
};
