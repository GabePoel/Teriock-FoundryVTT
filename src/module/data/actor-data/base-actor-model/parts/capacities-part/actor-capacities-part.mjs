import { TeriockActor } from "../../../../../documents/_module.mjs";
import { roundTo } from "../../../../../helpers/utils.mjs";
import { EvaluationField } from "../../../../fields/_module.mjs";

const { fields } = foundry.data;
const { utils } = foundry;

/**
 * Actor capacities part.
 * @param {typeof TeriockBaseActorModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @mixin
     * @implements {ActorCapacitiesPartInterface}
     */
    class ActorCapacitiesPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          attunements: new fields.SetField(new fields.DocumentIdField(), {
            label: "Attunements",
            hint: "The documents that the actor is attuned to.",
          }),
          carryingCapacity: new fields.SchemaField({
            factor: new EvaluationField({
              deterministic: true,
              initial: "max(@att.str, pow(min(@att.str - 5, 2), 0))",
              label: "Carrying Factor",
              min: 0,
            }),
            heavy: new EvaluationField({
              initial: "2 * (65 + 20 * @carry.factor)",
              label: "Heavy Carrying Capacity",
              min: 0,
            }),
            light: new EvaluationField({
              initial: "1 * (65 + 20 * @carry.factor)",
              label: "Light Carrying Capacity",
              min: 0,
            }),
            max: new EvaluationField({
              initial: "3 * (65 + 20 * @carry.factor)",
              label: "Maximum Carrying Capacity",
              min: 0,
            }),
          }),
          size: new fields.SchemaField({
            number: new EvaluationField({
              blank: "3",
              ceil: false,
              floor: false,
              initial: "3",
              label: "Size",
              max: 30,
              min: 0.25,
            }),
          }),
          weight: new fields.SchemaField({
            self: new EvaluationField({
              blank: "pow(3 + @size, 3)",
              initial: "pow(3 + @size, 3)",
              min: 0,
            }),
          }),
        });
        return schema;
      }

      /**
       * @inheritDoc
       * @param {object} data
       */
      static migrateData(data) {
        if (
          utils.getType(utils.getProperty(data, "weight")) === "string" &&
          utils.getProperty(data, "weight").includes("lb")
        ) {
          data.weight = parseFloat(
            utils.getProperty(data, "weight").replace("lb", "").trim(),
          );
        }
        if (
          utils.getType(utils.getProperty(data, "size.number.saved")) ===
          "number"
        ) {
          utils.setProperty(
            data,
            "size.number.raw",
            data.size.number.saved.toString(),
          );
        }
        super.migrateData(data);
      }

      #prepareCarryingCapacity() {
        this.carryingCapacity.factor.evaluate();
        this.carryingCapacity.light.evaluate();
        this.carryingCapacity.heavy.evaluate();
        this.carryingCapacity.max.evaluate();
      }

      #prepareEncumbrance() {
        let el = 0;
        if (this.weight.carried >= this.carryingCapacity.light.value) {
          el = 1;
        }
        if (this.weight.carried >= this.carryingCapacity.heavy.value) {
          el = 2;
        }
        if (this.weight.carried >= this.carryingCapacity.heavy.value) {
          el = 3;
        }
        this.encumbranceLevel = Math.min(this.encumbranceLevel + el, 3);
      }

      #prepareMoney() {
        const totalValue = Object.keys(TERIOCK.options.currency).reduce(
          (sum, key) => {
            this.money[key] = Math.max(0, this.money[key] || 0);
            const value = this.money[key] * TERIOCK.options.currency[key].value;
            return sum + value;
          },
          0,
        );
        const totalWeight = Object.keys(TERIOCK.options.currency).reduce(
          (sum, key) => {
            const weight =
              (this.money[key] || 0) * TERIOCK.options.currency[key].weight;
            return sum + weight;
          },
          0,
        );
        this.money.total = totalValue;
        this.weight.money = roundTo(totalWeight, 2);
      }

      #prepareWeightCarried() {
        let equipmentWeight = 0;
        for (const e of this.parent.equipment) {
          equipmentWeight += e.system.weight.total;
        }
        this.weight.equipment = equipmentWeight;
        this.weight.carried = Math.ceil(
          this.weight.equipment + this.weight.money,
        );
        this.weight.value =
          this.weight.equipment + this.weight.money + this.weight.self.value;
      }

      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        const weightCarried = this.weight.carried || 0;
        Object.assign(rollData, {
          "carry.factor": this.carryingCapacity.factor.value,
          "carry.heavy": this.carryingCapacity.heavy.value,
          "carry.heavy.hit":
            weightCarried >= this.carryingCapacity.heavy.value ? 1 : 0,
          "carry.light": this.carryingCapacity.light.value,
          "carry.light.hit":
            weightCarried >= this.carryingCapacity.light.value ? 1 : 0,
          "carry.max": this.carryingCapacity.max.value,
          "carry.max.hit":
            weightCarried >= this.carryingCapacity.max.value ? 1 : 0,
          size: this.size.number.value,
          weight: this.weight.self.value,
        });
        return rollData;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.encumbranceLevel = 0;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        this.size.number.evaluate();
        this.weight.self.evaluate();
        const sizeDefinition = TeriockActor.sizeDefinition(
          this.size.number.value,
        );
        this.size.category = sizeDefinition.category;
        this.size.length = sizeDefinition.length / 5;
        this.size.reach = sizeDefinition.reach;
        this.#prepareMoney();
      }

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();
        this.#prepareCarryingCapacity();
        this.#prepareWeightCarried();
        this.#prepareEncumbrance();
      }

      /** @inheritDoc */
      prepareVirtualEffects() {
        super.prepareVirtualEffects();
        if (
          this.encumbranceLevel > 0 &&
          !this.isProtected("statuses", "encumbered")
        ) {
          this.parent.statuses.add("encumbered");
          if (this.encumbranceLevel >= 1) {
            this.movementSpeed._value = Math.max(
              this.movementSpeed.value - 10,
              0,
            );
            if (this.encumbranceLevel === 1) {
              this.conditionInformation.encumbered.reasons.add(
                "Lightly Encumbered",
              );
            }
          } else if (this.encumbranceLevel >= 2) {
            this.conditionInformation.slowed.reasons.add("Heavily Encumbered");
            if (this.encumbranceLevel === 2) {
              this.conditionInformation.encumbered.reasons.add(
                "Heavily Encumbered",
              );
              this.parent.statuses.add("slowed");
            }
          } else if (this.encumbranceLevel >= 3) {
            this.conditionInformation.encumbered.reasons.add(
              "Cannot Carry More",
            );
          }
        }
      }
    }
  );
};
