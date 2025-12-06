import { multiplyFormula } from "../../../../helpers/formula.mjs";
import { isOwnerAndCurrentUser } from "../../../../helpers/utils.mjs";
import { StorageModel } from "../../../models/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof TeriockEquipmentModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockEquipmentModel}
     */
    class EquipmentStoragePart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        schema.storage = new fields.EmbeddedDataField(StorageModel);
        return schema;
      }

      /** @inheritDoc */
      get displayToggles() {
        return ["system.storage.enabled", ...super.displayToggles];
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
      get visibleTypes() {
        return this.storage.enabled
          ? super.visibleTypes
          : super.visibleTypes.filter((t) => t !== "equipment");
      }

      /** @inheritDoc */
      _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);
        if (isOwnerAndCurrentUser(this.parent, userId)) {
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
    }
  );
};
