import { EvaluationField } from "../../../../../fields/_module.mjs";
import { RangeModel } from "../../../../../models/unit-models/_module.mjs";

const { fields } = foundry.data;

/**
 * Ability interaction part.
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {AbilitySystem}
     * @implements {Teriock.Models.AbilityInteractionPartInterface}
     * @mixin
     */
    class AbilityInteractionPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          delivery: new fields.SchemaField({
            base: new fields.StringField({
              initial: "weapon",
              choices: TERIOCK.options.ability.delivery,
            }),
            parent: new fields.StringField({
              initial: null,
              nullable: true,
              choices: TERIOCK.options.ability.deliveryParent,
            }),
            package: new fields.StringField({
              initial: null,
              nullable: true,
              choices: TERIOCK.options.ability.deliveryPackage,
            }),
          }),
          executionTime: new fields.StringField({ initial: "a1" }),
          expansion: new fields.SchemaField({
            type: new fields.StringField({
              initial: null,
              nullable: true,
            }),
            range: new EvaluationField({
              model: RangeModel,
              label: "Expansion Range",
            }),
            featSaveAttribute: new fields.StringField({ initial: "mov" }),
            cap: new EvaluationField({
              deterministic: false,
            }),
          }),
          featSaveAttribute: new fields.StringField({
            initial: "mov",
            choices: TERIOCK.index.attributes,
          }),
          interaction: new fields.StringField({
            initial: "attack",
            choices: TERIOCK.options.ability.interaction,
          }),
          maneuver: new fields.StringField({
            initial: "active",
            choices: TERIOCK.options.ability.maneuver,
          }),
          range: new EvaluationField({ model: RangeModel, label: "Range" }),
          targets: new fields.SetField(
            new fields.StringField({
              choices: TERIOCK.options.ability.targets,
            }),
            {
              hint: "Valid targets for this ability.",
              initial: ["creature"],
              label: "Targets",
            },
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

        super.migrateData(data);
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
        // Add class
        if (this.parent.parent?.type === "rank") {
          const rank = /** @type {TeriockRank} */ this.parent.parent;
          data[`class.${rank.system.className.slice(0, 3).toLowerCase()}`] = 1;
          data[`class.${rank.system.className}`] = 1;
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
