import { prefixObject } from "../../../utils/_module.mjs";

/**
 * @import BaseExecution from "../../abstract/base-execution/base-execution.mjs";
 */

const { fields } = foundry.data;

/**
 * Mixin for executions that can consume an armament's ammunition.
 * @template {MixinBase<typeof BaseExecution>} T
 * @param {T} Base
 */
export default function AmmunitionExecutionMixin(Base) {
  /**
   * @mixin
   * @implements {Teriock.Execution.AmmunitionExecutionData}
   */
  class AmmunitionExecution
    extends /** @type {InitializedDataModel<T, Teriock.Execution.AmmunitionExecutionData>} */ (Base)
  {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { consumeAmmunition: new fields.BooleanField({ initial: true }) });
    }

    /**
     * The armament that consumes ammunition.
     * @returns {TeriockItem<"body"|"equipment">|null}
     */
    get _ammunitionArmament() {
      return null;
    }

    /**
     * The ammunition dialog entry.
     * @returns {Teriock.Execution.ExecutionDialogDocumentEntry}
     */
    get _ammunitionDialogDocument() {
      return {
        document: this.ammunition,
        editable: true,
        label: _loc("TERIOCK.TERMS.EquipmentClasses.ammunition"),
        nullable: true,
        getChoices: () => this.actor?.previewedTypes.equipment.filter(e => e.system.consumption.enabled) ?? [],
        update: ammunition => this._updateAmmunition(/** @type {TeriockItem<"equipment">} */ (ammunition)),
      };
    }

    /**
     * Whether the armament uses ammunition.
     * @returns {boolean}
     */
    get _usesAmmunition() {
      return Boolean(this._ammunitionArmament?.system.ammunition?.enabled);
    }

    /**
     * @inheritDoc
     * @returns {Promise<false|void>}
     */
    async _prepareUpdates() {
      if (
        this._usesAmmunition && this.consumeAmmunition && this.ammunition?.system.consumption.enabled
        && this.ammunition.isEditable
      ) {
        const amount = this._ammunitionArmament.system.ammunition.amount ?? this.ammunition.system.consumption.amount;
        this.operations.push({
          action: "update",
          documentName: "Item",
          parent: this.ammunition.parent,
          updates: [{
            _id: this.ammunition.id,
            system: { quantity: { value: Math.max(0, this.ammunition.system.quantity.value - amount) } },
          }],
        });
      }
      return super._prepareUpdates();
    }

    /**
     * Update the ammunition.
     * @param {TeriockItem<"equipment">|null} ammunition
     */
    _updateAmmunition(ammunition) {
      this.ammunition = ammunition;
    }

    /** @inheritDoc */
    getRollData() {
      const rollData = super.getRollData();
      if (this._usesAmmunition && this.ammunition) {
        Object.assign(rollData, prefixObject(this.ammunition.system.getLocalRollData(), "ammunition"));
      }
      return rollData;
    }
  }

  return AmmunitionExecution;
}
