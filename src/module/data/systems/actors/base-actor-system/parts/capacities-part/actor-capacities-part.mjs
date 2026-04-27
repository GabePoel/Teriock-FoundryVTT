import { equipmentConfig } from "../../../../../../constants/config/equipment-config.mjs";
import { TeriockActor } from "../../../../../../documents/_module.mjs";
import {
  initialNumber,
  initialString,
} from "../../../../../fields/helpers/initializers.mjs";
import { migrateEvaluationToNumber } from "../../../../../shared/migrations/_module.mjs";

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
     * @extends {Teriock.Models.ActorCapacitiesPartData}
     * @mixin
     */
    class ActorCapacitiesPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          encumbranceLevel: initialNumber(),
          size: new fields.SchemaField({
            category: initialString(),
            length: initialNumber(),
            number: new fields.NumberField({
              initial: 3,
              label: "Size",
              max: 30,
              min: 0.25,
            }),
            reach: initialNumber(),
          }),
          weight: new fields.SchemaField({
            carried: initialNumber(),
            equipment: initialNumber(),
            money: initialNumber(),
            self: new fields.NumberField({
              initial: null,
              interval: equipmentConfig.weight.interval,
              min: 0,
              nullable: true,
            }),
            value: initialNumber(),
          }),
        });
      }

      /** @inheritDoc */
      static migrateData(source, options, state) {
        if (
          utils.getType(utils.getProperty(source, "weight")) === "string" &&
          utils.getProperty(source, "weight").includes("lb")
        ) {
          source.weight = parseFloat(
            utils.getProperty(source, "weight").replace("lb", "").trim(),
          );
        }
        migrateEvaluationToNumber(source, "size.number", { fallback: 3 });
        migrateEvaluationToNumber(source, "weight.self", { fallback: null });
        return super.migrateData(source, options, state);
      }

      /**
       * Prepare carrying capacity from STR.
       */
      #prepareCarryingCapacity() {
        const factor =
          65 +
          20 *
            (this.attributes.str.score +
              Math.max(0, Math.pow(this.size.number - 5, 2)));
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
        this.encumbranceLevel = Math.clamp(this.encumbranceLevel + el, 0, 3);
      }

      /**
       * Prepare the amount of weight being carried.
       */
      #prepareWeightCarried() {
        let equipmentWeight = 0;
        for (const e of this.parent.equipment) {
          equipmentWeight += e.system.totalWeight;
        }
        this.weight.equipment = equipmentWeight;
        const carried = this.weight.equipment + this.weight.money;
        this.weight.carried = carried.toNearest(
          equipmentConfig.weight.interval,
        );
        const value =
          this.weight.equipment + this.weight.money + this.weight.self;
        this.weight.value = value.toNearest(equipmentConfig.weight.interval);
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
          size: this.size.number,
          weight: this.weight.self,
        });
        return rollData;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.attunements = new Set(
          this.parent.attunements.map((a) => a.system.target),
        );
        this.#prepareCarryingCapacity();
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        const sizeDefinition = TeriockActor.sizeConfig(this.size.number);
        this.size.category = sizeDefinition.category;
        this.size.length = sizeDefinition.length;
        this.size.reach = sizeDefinition.reach;
        if (this.weight.self === null) {
          this.weight.self = Math.pow(3 + this.size.number, 3);
        }
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
          if (this.encumbranceLevel >= 1) {
            this.movementSpeed = Math.max(this.movementSpeed - 10, 0);
          }
          if (this.encumbranceLevel >= 2) {
            this.parent.statuses.add("slowed");
            this.parent._addVirtualStatus(
              "slowed",
              "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.2",
              { localize: true },
            );
          }
          switch (this.encumbranceLevel) {
            case 1:
              this.parent._addVirtualStatus(
                "encumbered",
                "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.1",
                { localize: true },
              );
              break;
            case 2:
              this.parent._addVirtualStatus(
                "encumbered",
                "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.2",
                { localize: true },
              );
              break;
            case 3:
              this.parent._addVirtualStatus(
                "encumbered",
                "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.3",
                { localize: true },
              );
              break;
          }
        }
      }
    }
  );
};
