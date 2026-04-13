import { formulaExists } from "../../../../../../helpers/formula.mjs";
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
  return (
    /**
     * @extends {AttackSystem}
     * @extends {BaseEffectSystem}
     * @extends {Teriock.Models.AbilityUsagePartData}
     * @mixin
     */
    class AbilityUsagePart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          delivery: new fields.StringField({
            initial: "weapon",
            choices: TERIOCK.options.ability.delivery,
          }),
          executionTime: new fields.SchemaField({
            base: new fields.StringField({ initial: "a1" }),
            slow: new EvaluationField({ model: SlowExecutionTimeModel }),
          }),
          expansion: new fields.SchemaField({
            cap: new EvaluationField({ deterministic: false }),
            featSaveAttribute: new fields.StringField({ initial: "mov" }),
            range: new EvaluationField({ model: RangeModel }),
            type: new fields.StringField({ initial: null, nullable: true }),
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
        if (typeof data.range === "string") data.range = { raw: data.range };

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

        // Execution time migration
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
            data.executionTime.slow = { unit, raw };
          }
        }

        // Delivery migration
        if (data.delivery?.base) data.delivery = data.delivery.base;

        return super.migrateData(data);
      }

      /**
       * Execution wrappers.
       * @returns {string[]}
       */
      get _executionWrappers() {
        let time;
        if (this.maneuver !== "slow") {
          time =
            TERIOCK.options.ability.executionTime[this.maneuver][
              this.executionTime.base
            ];
        } else {
          time = this.executionTime.slow.text;
        }
        return [
          time || "",
          this.piercing.value.toUpperCase(),
          TERIOCK.options.ability.delivery[this.delivery] || "",
          this.interaction === "feat"
            ? TERIOCK.reference.attributes[this.featSaveAttribute]
            : "",
          TERIOCK.options.ability.interaction[this.interaction] || "",
        ];
      }

      /**
       * Expansion wrappers.
       * @returns {string[]}
       */
      get _expansionWrappers() {
        return this.expansion.type
          ? [
              ["detonate", "ripple"].includes(this.expansion.type)
                ? TERIOCK.reference.attributes[this.expansion.featSaveAttribute]
                : "",
              TERIOCK.options.ability.expansion[this.expansion.type] || "",
              this.expansion.range.abbreviation,
              formulaExists(this.expansion.cap.raw)
                ? _loc("TERIOCK.SYSTEMS.Ability.PANELS.expansionCap", {
                    value: this.expansion.cap.raw,
                  })
                : "",
            ]
          : [];
      }

      /**
       * Targeting wrappers.
       * @returns {string[]}
       */
      get _targetingWrappers() {
        return [
          this.isRanged ? this.range.abbreviation : "",
          ...Array.from(
            this.targets.map(
              (target) => TERIOCK.options.ability.targets[target],
            ),
          ),
          this.duration.text || "",
        ];
      }

      /**
       * Whether this has an area of effect.
       * @returns {boolean}
       */
      get isAoe() {
        return (
          this.delivery === "aura" ||
          this.delivery === "cone" ||
          this.expansion.type === "detonate"
        );
      }

      /**
       * If this ability is a ball.
       * @returns {boolean}
       */
      get isBall() {
        return this.delivery === "missile" && this.piercing.raw === 2;
      }

      /**
       * Whether this requires contact with a target.
       * @returns {boolean}
       */
      get isContact() {
        return ["armor", "bite", "hand", "item", "shield", "weapon"].includes(
          this.delivery,
        );
      }

      /**
       * If this ability is ranged.
       * @returns {boolean}
       */
      get isRanged() {
        return ["missile", "aura", "cone", "sight", "area"].includes(
          this.delivery,
        );
      }

      /**
       * If this ability is a ray.
       * @returns {boolean}
       */
      get isRay() {
        return this.delivery === "missile" && this.piercing.raw === 1;
      }

      /**
       * If this ability is a strike.
       * @returns {boolean}
       */
      get isStrike() {
        return this.delivery === "weapon" && this.interaction === "attack";
      }

      /**
       * If this ability is a touch.
       * @returns {boolean}
       */
      get isTouch() {
        return this.delivery === "hand" && this.piercing.raw === 2;
      }

      /**
       * If this ability needs an item.
       * @returns {boolean}
       */
      get needsItem() {
        return ["armor", "item", "shield", "weapon"].includes(this.delivery);
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
        if (this.delivery) data[`delivery.${this.delivery}`] = 1;
        data["delivery.ball"] = Number(this.isBall);
        data["delivery.ray"] = Number(this.isRay);
        data["delivery.touch"] = Number(this.isTouch);
        data["delivery.strike"] = Number(this.isStrike);
        data["delivery.item"] = Number(this.needsItem);
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
