import { initialNumber, initialString } from "../../../../../fields/tools/initializers.mjs";

const { fields } = foundry.data;

/**
 * Actor capacities part.
 *
 * Relevant wiki pages:
 * - [Carrying Capacity](https://wiki.teriock.com/index.php/Core:Carrying_Capacity)
 * - [Encumbered](https://wiki.teriock.com/index.php/Condition:Encumbered)
 * - [Size](https://wiki.teriock.com/index.php/Core:Size)
 * - [Weight](https://wiki.teriock.com/index.php/Core:Weight)
 *
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ActorCapacitiesPart & Teriock.Models.ActorCapacitiesPartData>}
 */
export default function ActorCapacitiesPart(Base) {
  /**
   * @implements {Teriock.Models.ActorCapacitiesPartData}
   * @mixin
   * @property {TeriockActor} parent
   */
  class ActorCapacitiesPart extends Base {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        carryingCapacity: new fields.SchemaField({
          factor: initialNumber(),
          heavy: initialNumber(),
          light: initialNumber(),
          max: initialNumber(),
        }, { persisted: false }),
        encumbranceLevel: initialNumber(),
        size: new fields.SchemaField({
          category: initialString(),
          length: initialNumber(),
          reach: initialNumber(),
          value: new fields.NumberField({ initial: 3, max: 30, min: 0.25, nullable: false, placeholder: "3" }),
        }),
        weight: new fields.SchemaField({
          carried: initialNumber(),
          equipment: initialNumber(),
          money: initialNumber(),
          self: new fields.NumberField({ initial: null, min: 0, nullable: true, placeholder: _loc("COMMON.Default") }),
          value: initialNumber(),
        }),
      });
    }

    /**
     * Prepare carrying capacity from STR.
     */
    #prepareCarryingCapacity() {
      const factor = 65 + 20 * (this.attributes.str.score + Math.pow(Math.max(this.size.value - 4, 0), 2));
      this.carryingCapacity = { factor, heavy: factor * 2, light: factor, max: factor * 3 };
    }

    /**
     * Prepare encumbrance level from current weight carried.
     */
    #prepareEncumbrance() {
      let el = 0;
      if (this.weight.carried >= this.carryingCapacity.light) { el = 1; }
      if (this.weight.carried >= this.carryingCapacity.heavy) { el = 2; }
      if (this.weight.carried >= this.carryingCapacity.max) { el = 3; }
      this.encumbranceLevel = Math.clamp(this.encumbranceLevel + el, 0, 3);
    }

    /**
     * Prepare the amount of weight being carried.
     */
    #prepareWeightCarried() {
      let equipmentWeight = 0;
      for (const e of this.parent.previewedTypes.equipment) {
        equipmentWeight += e.system.totalWeight;
      }
      this.weight.equipment = equipmentWeight;
      const carried = this.weight.equipment + this.weight.money;
      this.weight.carried = carried.toNearest(TERIOCK.config.system.unitPrecision);
      const value = this.weight.equipment + this.weight.money + this.weight.self;
      this.weight.value = value.toNearest(TERIOCK.config.system.unitPrecision);
    }

    /** @inheritDoc */
    getRollData() {
      const rollData = super.getRollData();
      const weightCarried = this.weight.carried || 0;
      Object.assign(rollData, {
        "carry.factor": this.carryingCapacity.factor,
        "carry.heavy": this.carryingCapacity.heavy,
        "carry.heavy.hit": Number(weightCarried >= this.carryingCapacity.heavy),
        "carry.light": this.carryingCapacity.light,
        "carry.light.hit": Number(weightCarried >= this.carryingCapacity.light),
        "carry.max": this.carryingCapacity.max,
        "carry.max.hit": Number(weightCarried >= this.carryingCapacity.max),
        size: this.size.value,
        weight: this.weight.self,
      });
      return rollData;
    }

    /** @inheritDoc */
    prepareBaseData() {
      super.prepareBaseData();
      this.#prepareCarryingCapacity();
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      const sizeDefinition = this.parent.constructor.getSizeConfig(this.size.value);
      this.size.category = sizeDefinition.category;
      this.size.length = sizeDefinition.length;
      this.size.reach = sizeDefinition.reach;
      this.weight.self ??= this.weight.self = this.parent.constructor.getDefaultWeight(this.size.value);
      this.weight.self = this.weight.self.toNearest(TERIOCK.config.system.unitPrecision);
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
        this.encumbranceLevel > 0 && !this.settings.getSetting("autoEncumbrance")
        && !this.isProtected("conditions", "encumbered")
      ) {
        if (this.encumbranceLevel >= 1) { this.movementSpeed = Math.max(this.movementSpeed - 10, 0); }
        if (this.encumbranceLevel >= 2) {
          this.parent.statuses.add("slowed");
          this._addVirtualCondition("slowed", "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.2", { localize: true });
        }
        switch (this.encumbranceLevel) {
          case 1:
            this._addVirtualCondition("encumbered", "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.1", { localize: true });
            break;
          case 2:
            this._addVirtualCondition("encumbered", "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.2", { localize: true });
            break;
          case 3:
            this._addVirtualCondition("encumbered", "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.3", { localize: true });
            break;
          default:
            break;
        }
      }
    }
  }

  return ActorCapacitiesPart;
}
