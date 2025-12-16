import { multiplyFormula } from "../../../../../helpers/formula.mjs";
import { roundTo } from "../../../../../helpers/unit.mjs";
import { EvaluationField } from "../../../../fields/_module.mjs";
import { StorageModel } from "../../../../models/_module.mjs";

const { EmbeddedDataField } = foundry.data.fields;

/**
 * @param {typeof TeriockEquipmentModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockEquipmentModel}
     * @implements {EquipmentStoragePartInterface}
     * @mixin
     */
    class EquipmentStoragePart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return {
          ...super.defineSchema(),
          storage: new EmbeddedDataField(StorageModel),
          weight: new EvaluationField({
            floor: false,
            ceil: false,
            decimals: 2,
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
              return {
                _id: e._id,
                "system._sup": null,
              };
            });
            this.parent.updateChildDocuments("Item", updateData).then();
          }
        }
      }

      /** @inheritDoc */
      async _preCreate(data, options, user) {
        if ((await super._preCreate(data, options, user)) === false) {
          return false;
        }
        const elder = await this.parent.getElder();
        if (elder?.type === "equipment" && !elder.system.storage.enabled) {
          return false;
        }
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        Object.assign(data, {
          weight: this.weight.formula,
          str: this.minStr.formula,
        });
        return data;
      }

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();
        this.storage.maxCount.evaluate();
        this.storage.maxWeight.evaluate();
        if (this.parent.elder?.type === "equipment") {
          if (this.parent.elder?.system?.storage?.enabled) {
            this.weight.raw = multiplyFormula(
              this.weight.raw,
              this.parent.elder?.system.storage.weightMultiplier,
            );
          }
        }
        this.weight.evaluate();
        this.weight.total = this.weight.value;
        if (this.consumable) {
          this.weight.total = roundTo(this.weight.value * this.quantity, 2);
        }
      }
    }
  );
};
