import { TeriockDialog } from "../../../../../../applications/api/_module.mjs";
import { DocumentSelector } from "../../../../../../applications/dialogs/_module.mjs";
import equipmentConfig from "../../../../../../constants/config/equipment-config.mjs";
import { makeIcon, makeIconClass } from "../../../../../../helpers/icon.mjs";
import { resolveDocument } from "../../../../../../helpers/resolve.mjs";
import { StorageModel } from "../../../../../models/_module.mjs";

const { EmbeddedDataField, NumberField } = foundry.data.fields;

/**
 * @param {typeof EquipmentSystem} Base
 */
export default Base => {
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
          weight: new foundry.data.fields.NumberField({ initial: 0, nullable: false }),
        };
      }

      /** @inheritDoc */
      get _displayMessagesError() {
        const messages = super._displayMessagesError;
        if (this.storage.isOverCountCapacity) { this._addErrorMessage("overCarriedCount", messages); }
        if (this.storage.isOverWeightCapacity) { this._addErrorMessage("overCarriedWeight", messages); }
        return messages;
      }

      /** @inheritDoc */
      get _displayToggles() {
        return ["system.storage.enabled", ...super._displayToggles];
      }

      /**
       * Whether this can stack.
       * @returns {TeriockEquipment[]}
       */
      get _stackingCandidates() {
        return (this.parent.elder?.equipment ?? []).filter(e =>
          e.name === this.parent.name
          && e.typedIdentifier === this.parent.typedIdentifier
          && e.elder?.uuid === this.parent.elder?.uuid
          && e.uuid !== this.parent.uuid
          && e.system.consumable === this.consumable
          && e.system.quantity + this.quantity <= e.system.maxQuantity.value
        );
      }

      /**
       * The total weight of this equipment and everything it carries.
       * @returns {number}
       */
      get totalWeight() {
        if (this.stashed) { return 0; }
        let total = this.weight * (this.consumable ? this.quantity : 1) * this.weightMultiplier;
        if (this.storage.enabled) { total += this.storage.carriedWeight; }
        return total.toNearest(equipmentConfig.weight.interval);
      }

      /** @inheritDoc */
      get visibleTypes() {
        return this.storage.enabled ? super.visibleTypes : super.visibleTypes.filter(t => t !== "equipment");
      }

      /**
       * How much to adjust the weight of each individual instance of this equipment by.
       * @returns {number}
       */
      get weightMultiplier() {
        if (this.parent.elder?.type === "equipment") { return this.parent.elder?.system?.storage?.weightMultiplier
            ?? 1; }
        return 1;
      }

      /** @inheritDoc */
      _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);
        if (this.parent.checkEditor(userId)) {
          if (!this.storage.enabled && this.parent.equipment.length > 0) {
            const updateData = this.parent.equipment.map(e => {
              return { _id: e._id, "system._sup": null };
            });
            this.parent.updateChildDocuments("Item", updateData);
          }
        }
      }

      /** @inheritDoc */
      async _preCreate(data, options, user) {
        const yes = await super._preCreate(data, options, user);
        if (yes === false) { return false; }

        const elder = await this.parent.getElder();
        if (elder?.type === "equipment" && !elder.system.storage.enabled) { return false; }
      }

      /** @inheritDoc */
      async _preUpdate(changes, options, user) {
        const yes = await super._preUpdate(changes, options, user);
        if (yes === false) { return false; }

        const _sup = foundry.utils.getProperty(changes, "system._sup");
        if (_sup) {
          const collection = this.siblingCollection;
          const sup = await resolveDocument(collection?.get(_sup));
          if (sup?.type === "equipment" && !sup.system.storage.enabled) { return false; }
        }
      }

      /** @inheritDoc */
      getCardContextMenuEntries(doc) {
        const entries = super.getCardContextMenuEntries(doc);
        entries.push(...[{
          group: "document",
          icon: makeIcon(TERIOCK.display.icons.equipment.stack, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.stack.title"),
          onClick: async () => await this.groupStackDialog(),
          visible: () =>
            this.consumable
            && this.quantity < this.maxQuantity.value
            && this._stackingCandidates.length
            && this.parent._checkValidEditorDocument(doc, { self: false }),
        }, {
          group: "document",
          icon: makeIcon(TERIOCK.display.icons.equipment.unstack, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.unstack.title"),
          onClick: async () => await this.groupUnstackDialog(),
          visible: () =>
            this.consumable && this.quantity > 1 && this.parent._checkValidEditorDocument(doc, { self: false }),
        }]);
        return entries;
      }

      /** @inheritDoc */
      getLocalRollData() {
        return Object.assign(super.getLocalRollData(), {
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
      }

      /**
       * Merge this into another group if it's consumable.
       * @returns {Promise<void>}
       */
      async groupStackDialog() {
        if (!this.consumable) { return; }
        const candidates = this._stackingCandidates;
        if (!candidates.length) { return; }
        const chosen = await DocumentSelector.selectSingle(candidates, {
          auto: true,
          hint: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.stack.hint"),
          icon: makeIconClass(TERIOCK.display.icons.equipment.stack, "title"),
          openable: true,
          textKey: "system.remainingString",
          title: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.stack.title"),
        });
        if (!chosen) { return; }
        const operations = [{
          action: "update",
          documentName: "Item",
          ids: [chosen.id],
          pack: chosen.pack,
          parent: chosen.parent,
          updates: [{ _id: chosen.id, system: { quantity: chosen.system.quantity + this.quantity } }],
        }, {
          action: "delete",
          documentName: "Item",
          ids: [this.parent.id],
          pack: this.parent.pack,
          parent: this.parent.parent,
        }];
        await foundry.documents.modifyBatch(operations);
      }

      /**
       * Split this equipment into multiple groups if it's consumable.
       * @param {number} amount
       * @returns {Promise<void>}
       */
      async groupUnstack(amount = 0) {
        if (!this.consumable || !amount || amount >= this.quantity) { return; }
        const operations = [{
          action: "create",
          data: [
            foundry.utils.mergeObject(this.parent.toObject(), {
              _id: foundry.utils.randomID(),
              system: { quantity: amount },
            }),
          ],
          documentName: "Item",
          pack: this.parent.pack,
          parent: this.parent.parent,
        }, {
          action: "update",
          documentName: "Item",
          ids: [this.document.id],
          pack: this.parent.pack,
          parent: this.parent.parent,
          updates: [{ _id: this.document.id, system: { quantity: this.quantity - amount } }],
        }];
        await foundry.documents.modifyBatch(operations);
      }

      /**
       * Open a dialog to split this equipment into multiple groups if it's consumable.
       * @returns {Promise<void>}
       */
      async groupUnstackDialog() {
        if (!this.consumable || !this.quantity) { return; }
        const content = document.createElement("div");
        const amountField = new NumberField({
          hint: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.unstack.amount.hint"),
          initial: 1,
          integer: true,
          label: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.unstack.amount.label"),
          max: this.quantity,
          min: 0,
          nullable: false,
        });
        content.append(amountField.toFormGroup({ rootId: foundry.utils.randomID() }, { name: "amount", value: 1 }));
        await TeriockDialog.prompt({
          content,
          ok: {
            callback: async (_event, button) => {
              const amount = button.form.elements.amount.value ?? 0;
              await this.groupUnstack(amount);
            },
          },
          window: {
            icon: makeIconClass(TERIOCK.display.icons.equipment.unstack, "title"),
            title: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.unstack.title"),
          },
        });
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (this.stashed || this.parent.elder?.type === "species") {
          this.weight = 0;
          this.storage.weightMultiplier = 0;
        }
      }

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();
        this.weight = this.weight.toNearest(equipmentConfig.weight.interval);
      }
    }
  );
};
