import { characterOptions } from "../../../../../../constants/options/character-options.mjs";
import { equipmentOptions } from "../../../../../../constants/options/equipment-options.mjs";
import { TeriockActor } from "../../../../../../documents/_module.mjs";
import { EvaluationField } from "../../../../../fields/_module.mjs";

const { fields } = foundry.data;
const { utils } = foundry;

/**
 * Actor capacities part.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorCapacitiesPartInterface}
     * @mixin
     */
    class ActorCapacitiesPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          size: new fields.SchemaField({
            number: new EvaluationField({
              blank: "3",
              ceil: false,
              deterministic: true,
              floor: false,
              initial: "3",
              label: "Size",
              max: 30,
              min: 0.25,
            }),
          }),
          weight: new fields.SchemaField({
            self: new EvaluationField({
              blank: characterOptions.defaults.weight,
              deterministic: true,
              initial: characterOptions.defaults.weight,
              interval: equipmentOptions.weight.interval,
              min: 0,
            }),
          }),
        });
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

      /**
       * Prepare carrying capacity from STR.
       */
      #prepareCarryingCapacity() {
        const factor = 65 + 20 * this.attributes.str.score;
        this.carryingCapacity = {
          factor,
          heavy: factor * 2,
          light: factor,
          max: factor * 3,
        };
      }

      /**
       * Prepare encumbrance level from current weight carried.
       */
      #prepareEncumbrance() {
        let el = 0;
        if (this.weight.carried >= this.carryingCapacity.light) el = 1;
        if (this.weight.carried >= this.carryingCapacity.heavy) el = 2;
        if (this.weight.carried >= this.carryingCapacity.max) el = 3;
        this.encumbranceLevel = Math.min(this.encumbranceLevel + el, 3);
      }

      /**
       * Prepare the amount of weight being carried.
       */
      #prepareWeightCarried() {
        let equipmentWeight = 0;
        for (const e of this.parent.equipment) {
          equipmentWeight += e.system.weight.total;
        }
        this.weight.equipment = equipmentWeight;
        const carried = this.weight.equipment + this.weight.money;
        this.weight.carried = carried.toNearest(
          equipmentOptions.weight.interval,
        );
        const value =
          this.weight.equipment + this.weight.money + this.weight.self.value;
        this.weight.value = value.toNearest(equipmentOptions.weight.interval);
      }

      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        const weightCarried = this.weight.carried || 0;
        Object.assign(rollData, {
          "carry.factor": this.carryingCapacity.factor,
          "carry.heavy": this.carryingCapacity.heavy,
          "carry.heavy.hit": Number(
            weightCarried >= this.carryingCapacity.heavy,
          ),
          "carry.light": this.carryingCapacity.light,
          "carry.light.hit": Number(
            weightCarried >= this.carryingCapacity.light,
          ),
          "carry.max": this.carryingCapacity.max,
          "carry.max.hit": Number(weightCarried >= this.carryingCapacity.max),
          size: this.size.number.value,
          weight: this.weight.self.value,
        });
        return rollData;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.encumbranceLevel = 0;
        this.attunements = new Set(
          this.parent.attunements.map((a) => a.system.target),
        );
        this.#prepareCarryingCapacity();
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        this.size.number.evaluate();
        this.weight.self.evaluate();
        const sizeDefinition = TeriockActor.sizeConfig(this.size.number.value);
        this.size.category = sizeDefinition.category;
        this.size.length = sizeDefinition.length;
        this.size.reach = sizeDefinition.reach;
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
            this.movementSpeed = Math.max(this.movementSpeed - 10, 0);
          }
          if (this.encumbranceLevel >= 2) {
            this.parent.statuses.add("slowed");
            this.conditionInformation.slowed.reasons.add(
              game.i18n.localize("TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.2"),
            );
          }
          let encumbranceReason = game.i18n.localize(
            "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.0",
          );
          switch (this.encumbranceLevel) {
            case 1:
              encumbranceReason = game.i18n.localize(
                "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.1",
              );
              break;
            case 2:
              encumbranceReason = game.i18n.localize(
                "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.2",
              );
              break;
            case 3:
              encumbranceReason = game.i18n.localize(
                "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.3",
              );
              break;
          }
          this.conditionInformation.encumbered.reasons.add(encumbranceReason);
        }
      }
    }
  );
};
