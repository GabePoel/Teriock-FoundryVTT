import { EvaluationField } from "../../../../../fields/_module.mjs";
import {
  RangeModel,
  SlowExecutionTimeModel,
} from "../../../../../models/unit-models/_module.mjs";

const { fields } = foundry.data;

/**
 * Ability usage part: delivery, timing, interaction, targets, range, expansion.
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {AbilitySystem}
     * @implements {Teriock.Models.AbilityUsagePartInterface}
     * @mixin
     */
    class AbilityUsagePart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          delivery: new fields.SchemaField({
            base: new fields.StringField({
              initial: "weapon",
              choices: TERIOCK.options.ability.delivery,
            }),
            package: new fields.StringField({
              initial: null,
              nullable: true,
              choices: TERIOCK.options.ability.deliveryPackage,
            }),
            parent: new fields.StringField({
              initial: null,
              nullable: true,
              choices: TERIOCK.options.ability.deliveryParent,
            }),
          }),
          executionTime: new fields.SchemaField({
            base: new fields.StringField({ initial: "a1" }),
            slow: new EvaluationField({
              model: SlowExecutionTimeModel,
            }),
          }),
          expansion: new fields.SchemaField({
            cap: new EvaluationField({
              deterministic: false,
            }),
            featSaveAttribute: new fields.StringField({ initial: "mov" }),
            range: new EvaluationField({ model: RangeModel }),
            type: new fields.StringField({
              initial: null,
              nullable: true,
            }),
          }),
          featSaveAttribute: new fields.StringField({
            initial: "mov",
            choices: TERIOCK.reference.attributes,
          }),
          interaction: new fields.StringField({
            initial: "attack",
            choices: TERIOCK.options.ability.interaction,
          }),
          maneuver: new fields.StringField({
            initial: "active",
            choices: TERIOCK.options.ability.maneuver,
          }),
          range: new EvaluationField({ model: RangeModel }),
          targets: new fields.SetField(
            new fields.StringField({
              choices: TERIOCK.options.ability.targets,
            }),
            { initial: ["creature"] },
          ),
        });
      }

      /** @inheritDoc */
      static migrateData(data) {
        // Range migration
        if (typeof data.range === "string") {
          data.range = { raw: data.range };
        }

        // Expansion migration
        if (typeof data.expansion === "string") {
          data.expansion = { type: data.expansion };
        }
        if (typeof data.expansion !== "object") {
          data.expansion = {};
        }
        if (typeof data.expansionRange === "string") {
          data.expansion.range = { raw: data.expansionRange };
        }

        // Execution time
        if (typeof data.executionTime === "string") {
          data.executionTime = { base: data.executionTime };
          if (data.maneuver === "slow") {
            let unit;
            let raw;
            const lower = data.executionTime.base.toLowerCase();
            if (lower.includes("short")) unit = "shortRest";
            if (lower.includes("long")) unit = "longRest";
            const units = ["second", "minute", "hour", "day", "week", "year"];
            for (const u of units) {
              if (lower.includes(u)) {
                unit = u;
                raw = lower.trim().split(" ")[0];
              }
            }
            data.executionTime.slow = {
              unit,
              raw,
            };
          }
        }

        super.migrateData(data);
      }

      /**
       * Whether this has an area of effect.
       * @returns {boolean}
       */
      get isAoe() {
        return (
          this.delivery.base === "aura" ||
          this.delivery.base === "cone" ||
          this.expansion.type === "detonate"
        );
      }

      /**
       * Whether this requires contact with a target.
       * @returns {boolean}
       */
      get isContact() {
        return ["armor", "bite", "hand", "item", "shield", "weapon"].includes(
          this.delivery.base,
        );
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        Object.assign(data, {
          maneuver: this.maneuver,
          [`maneuver.${this.maneuver}`]: 1,
          interaction: this.interaction,
          [`interaction.${this.interaction}`]: 1,
          time: this.executionTime,
          [`time.${this.executionTime}`]: 1,
          range: this.range.value,
        });
        // Add deliveries
        if (this.delivery.base) {
          data[`delivery.${this.delivery.base}`] = 1;
        }
        if (this.delivery.parent) {
          data[`delivery.${this.delivery.parent}`] = 1;
        }
        if (this.delivery.package) {
          data[`delivery.${this.delivery.package}`] = 1;
        }
        if (this.interaction === "feat") {
          data[`attr.${this.featSaveAttribute}`] = 1;
        }
        if (this.expansion.type) {
          Object.assign(data, {
            expansion: this.expansion,
            [`expansion.${this.expansion.type}`]: 1,
            [`expansion.attr.${this.expansion.featSaveAttribute}`]: 1,
            [`expansion.range`]: this.expansion.range.value,
          });
        }
        // Add targets
        for (const target of this.targets) {
          data[`target.${target}`] = 1;
        }
        return data;
      }
    }
  );
};
