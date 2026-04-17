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
            interval: equipmentOptions.weight.interval,
            initial: 0,
          }),
        };
      }

      /** @inheritDoc */
      get displayToggles() {
        return ["system.storage.enabled", ...super.displayToggles];
      }

      /** @inheritDoc */
      get visibleTypes() {
        return this.storage.enabled
          ? super.visibleTypes
          : super.visibleTypes.filter((t) => t !== "equipment");
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
        if (this.stashed) this.storage.weightMultiplier = "0";
        this.totalWeight = this.weight;
      }

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();
        let weight = this.weight;
        if (
          this.parent.elder?.type === "equipment" &&
          this.parent.elder?.system?.storage?.enabled
        ) {
          const multiplier =
            this.parent.elder?.system.storage.weightMultiplier ?? 1;
          weight = this.weight * multiplier;
        }
        if (this.stashed) weight = 0;
        this.weight = weight.toNearest(equipmentOptions.weight.interval);
        this.totalWeight = this.weight;
        if (this.consumable) {
          const total = this.weight * this.quantity;
          this.totalWeight = total.toNearest(equipmentOptions.weight.interval);
        }
      }
    }
  );
};
