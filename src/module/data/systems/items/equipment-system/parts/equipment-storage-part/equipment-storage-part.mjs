import { equipmentOptions } from "../../../../../../constants/options/equipment-options.mjs";
import { StorageModel } from "../../../../../models/_module.mjs";

const { EmbeddedDataField } = foundry.data.fields;

/**
 * @param {typeof EquipmentSystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {ConsumableSystem}
     * @extends {Teriock.Models.EquipmentStoragePartData}
     * @mixin
     */
    class EquipmentStoragePart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return {
          ...super.defineSchema(),
          storage: new EmbeddedDataField(StorageModel),
          weight: new foundry.data.fields.NumberField({
            initial: 0,
            nullable: false,
          }),
        };
      }

      /** @inheritDoc */
      get displayToggles() {
        return ["system.storage.enabled", ...super.displayToggles];
      }

      /**
       * The total weight of this equipment and everything it carries.
       * @returns {number}
       */
      get totalWeight() {
        if (this.stashed) return 0;
        let total =
          this.weight *
          (this.consumable ? this.quantity : 1) *
          this.weightMultiplier;
        if (this.storage.enabled) total += this.storage.carriedWeight;
        return total.toNearest(equipmentOptions.weight.interval);
      }

      /** @inheritDoc */
      get visibleTypes() {
        return this.storage.enabled
          ? super.visibleTypes
          : super.visibleTypes.filter((t) => t !== "equipment");
      }

      /**
       * How much to adjust the weight of each individual instance of this equipment by.
       * @returns {number}
       */
      get weightMultiplier() {
        if (this.parent.elder?.type === "equipment") {
          return this.parent.elder.system.storage.weightMultiplier;
        }
        return 1;
      }

      /** @inheritDoc */
      _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);
        if (this.parent.checkEditor(userId)) {
          if (!this.storage.enabled && this.parent.equipment.length > 0) {
            const updateData = this.parent.equipment.map((e) => {
              return { _id: e._id, "system._sup": null };
            });
            this.parent.updateChildDocuments("Item", updateData);
          }
        }
      }

      /** @inheritDoc */
      async _preCreate(data, options, user) {
        const yes = await super._preCreate(data, options, user);
        if (yes === false) return false;

        const elder = await this.parent.getElder();
        if (elder?.type === "equipment" && !elder.system.storage.enabled) {
          return false;
        }
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        Object.assign(data, {
          storage: Number(this.storage.enabled),
          "storage.count": this.storage.carriedCount,
          "storage.count.max": this.storage.maxCount,
          "storage.count.over": Number(this.storage.isOverCountCapacity),
          "storage.weight": this.storage.carriedWeight,
          "storage.weight.max": this.storage.maxWeight,
          "storage.weight.mult": this.storage.weightMultiplier,
          "storage.weight.over": Number(this.storage.isOverWeightCapacity),
          weight: this.totalWeight,
        });
        return data;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (this.stashed) {
          this.weight = 0;
          this.storage.weightMultiplier = 0;
        }
      }

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();
        this.weight = this.weight.toNearest(equipmentOptions.weight.interval);
      }
    }
  );
};
