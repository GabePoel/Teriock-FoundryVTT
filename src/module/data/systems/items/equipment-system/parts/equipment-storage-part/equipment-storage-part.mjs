import { TeriockDialog } from "../../../../../../applications/api/_module.mjs";
import { DocumentSelector } from "../../../../../../applications/dialogs/_module.mjs";
import { makeIcon, makeIconClass, safeInf } from "../../../../../../utils/_module.mjs";
import { InfiniteNumberField } from "../../../../../fields/_module.mjs";
import { migrateRename } from "../../../../../fields/tools/migrations.mjs";

const { fields } = foundry.data;

/**
 * @import { DatabaseUpdateOperation, DatabaseWriteOperation } from "@common/abstract/_types.mjs";
 */

/**
 * Equipment mixin that handles storage of other equipment.
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function EquipmentStoragePart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.EquipmentStoragePartData}
   * @property {TeriockItem<"equipment">} parent
   */
  class EquipmentStoragePart
    extends /** @type {InitializedDataModel<T, Teriock.Models.EquipmentStoragePartData>} */ (Base)
  {
    /** @inheritDoc */
    static defineSchema() {
      return {
        ...super.defineSchema(),
        storage: new fields.SchemaField({
          count: new fields.SchemaField({ max: new InfiniteNumberField() }),
          enabled: new fields.BooleanField({ initial: false, required: false }),
          weight: new fields.SchemaField({
            max: new InfiniteNumberField(),
            multiplier: new fields.NumberField({
              initial: 1,
              min: 0,
              nullable: false,
              placeholder: "1",
              required: true,
            }),
          }),
        }),
        weight: new fields.NumberField({ initial: 0, nullable: false, placeholder: "0", required: true }),
      };
    }

    /** @inheritDoc */
    static migrateData(source, options) {
      migrateRename(source, "storage.maxCount", "storage.count.max");
      migrateRename(source, "storage.maxWeight", "storage.weight.max");
      migrateRename(source, "storage.weightMultiplier", "storage.weight.multiplier");
      return super.migrateData(source, options);
    }

    /**
     * Ask the user which matching, non-full consumable stack this equipment should merge into.
     * @param {TeriockActiveEffect|TeriockActor|TeriockItem} elder
     * @returns {Promise<TeriockItem<"equipment">|null>}
     */
    async #findStackTarget(elder) {
      if (!elder || !this.consumption.enabled || !this._source.quantity?.value) { return null; }
      const stackCandidates = (await elder.children.getType("equipment")).filter(e =>
        e.master?.uuid === elder.uuid
        && e.uuid !== this.parent.uuid
        && e.name === this.parent.name
        && e.system.identifier === this._source.identifier
        && e.system.consumption.enabled
        && e.system.quantity.value < e.system.quantity.max
      );
      if (stackCandidates.length === 0) { return null; }
      const selected = await DocumentSelector.selectSingle(stackCandidates, {
        auto: false,
        hint: _loc("TERIOCK.SHEETS.Common.DIALOGS.EquipmentStackConfirmation.hint", { name: this.parent.name }),
        openable: true,
        silent: true,
        textKey: "system.remainingString",
        title: _loc("TERIOCK.SHEETS.Common.DIALOGS.EquipmentStackConfirmation.title"),
      });
      return selected || null;
    }

    /**
     * The update that merges this equipment's quantity into a stack it is being combined with.
     * @param {TeriockItem<"equipment">} stack
     * @returns {DatabaseUpdateOperation}
     */
    #stackOperation(stack) {
      return {
        action: "update",
        documentName: stack.documentName,
        pack: stack.pack,
        parent: stack.parent,
        updates: [{
          _id: stack.id,
          "system.quantity.value": stack.system.quantity.value + this._source.quantity.value,
        }],
      };
    }

    /**
     * Reject a document that can't hold this equipment.
     * @param {TeriockActiveEffect|TeriockActor|TeriockItem} elder
     * @param {DatabaseWriteOperation & Teriock.System._Operation} operation
     * @returns {boolean}
     */
    #validateStorage(elder, operation) {
      if (elder?.type !== "equipment" || elder.system.storage.enabled) { return true; }
      if (operation.notifyOnFailure) {
        ui.notifications.error("TERIOCK.SHEETS.Equipment.NOTIFICATIONS.notStorage", {
          format: { name: elder.name },
          localize: true,
        });
      }
      return false;
    }

    /** @inheritDoc */
    get _displayToggles() {
      return ["system.storage.enabled", ...super._displayToggles];
    }

    /**
     * Whether this can stack.
     * @returns {TeriockItem<"equipment">[]}
     */
    get _stackingCandidates() {
      return (this.parent.elder?.previewedTypes.equipment ?? []).filter(e =>
        e.name === this.parent.name
        && e.typedIdentifier === this.parent.typedIdentifier
        && e.elder?.uuid === this.parent.elder?.uuid
        && e.uuid !== this.parent.uuid
        && e.system.consumption.enabled === this.consumption.enabled
        && e.system.quantity.value + this.quantity.value <= e.system.quantity.max
      );
    }

    /**
     * The total weight of this equipment and everything it carries.
     * @returns {number}
     */
    get totalWeight() {
      if (this.stashed) { return 0; }
      let total = this.weight * (this.consumption.enabled ? this.quantity.value : 1) * this.weightMultiplier;
      if (this.storage.enabled) { total += this.storage.weight.value; }
      return total.toNearest(TERIOCK.CONST.UNIT_PRECISION);
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
      if (this.parent.elder?.type === "equipment") { return this.parent.elder?.system?.storage?.weight?.multiplier
          ?? 1; }
      return 1;
    }

    /** @inheritDoc */
    _getTipErrors() {
      return Object.assign(super._getTipErrors(), {
        overCarriedCount: () => this.storage.count.over,
        overCarriedWeight: () => this.storage.weight.over,
      });
    }

    /** @inheritDoc */
    _onUpdate(changed, options, userId) {
      super._onUpdate(changed, options, userId);
      if (this.parent.checkEditor(userId)) {
        if (!this.storage.enabled && this.parent.previewedTypes.equipment.length > 0) {
          const updateData = this.parent.previewedTypes.equipment.map(e => {
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
      if (!this.#validateStorage(elder, options)) { return false; }
      if (options.interactive) {
        // Merging into a stack already present replaces this creation, so nothing new is written.
        const target = await this.#findStackTarget(elder);
        if (target) {
          await foundry.documents.modifyBatch([this.#stackOperation(target)]);
          return false;
        }
      }
    }

    /** @inheritDoc */
    async _preUpdate(changes, options, user) {
      const yes = await super._preUpdate(changes, options, user);
      if (yes === false) { return false; }

      if (!foundry.utils.hasProperty(changes, "system._sup")) { return; }
      const _sup = foundry.utils.getProperty(changes, "system._sup");
      // A cleared sup means the equipment is being taken out of its container and back onto its actor.
      const elder = _sup
        ? await this.parent.fetchFromUuid(this.parent.supCollection?.get(_sup)?.uuid)
        : this.parent.actor;
      if (!this.#validateStorage(elder, options)) { return false; }
      if (options.interactive) {
        // Merging into a stack at the destination replaces the move, so original equipment is deleted.
        const target = await this.#findStackTarget(elder);
        if (target) {
          await foundry.documents.modifyBatch([this.#stackOperation(target), {
            action: "delete",
            documentName: this.parent.documentName,
            ids: [this.parent.id],
            pack: this.parent.pack,
            parent: this.parent.parent,
          }]);
          return false;
        }
      }
    }

    /** @inheritDoc */
    getEmbedContextMenuEntries(doc) {
      const entries = super.getEmbedContextMenuEntries(doc);
      entries.push(...[{
        group: "document",
        icon: makeIcon(TERIOCK.DISPLAY.icons.manifest.equipment.stack, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.stack.title"),
        onClick: async () => await this.groupStackDialog(),
        visible: () =>
          this.consumption.enabled
          && this.quantity.value < this.quantity.max
          && this._stackingCandidates.length
          && this.getNearestDocument().isOwner && this.getNearestDocument().checkAncestor(doc),
      }, {
        group: "document",
        icon: makeIcon(TERIOCK.DISPLAY.icons.manifest.equipment.unstack, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.unstack.title"),
        onClick: async () => await this.groupUnstackDialog(),
        visible: () =>
          this.consumption.enabled && this.quantity.value > 1 && this.getNearestDocument().isOwner
          && this.getNearestDocument().checkAncestor(doc),
      }]);
      return entries;
    }

    /** @inheritDoc */
    getLocalRollData() {
      return Object.assign(super.getLocalRollData(), {
        storage: Number(this.storage.enabled),
        "storage.count": this.storage.count.value,
        "storage.count.max": safeInf(this.storage.count.max),
        "storage.count.over": Number(this.storage.count.over),
        "storage.weight": this.storage.weight.value,
        "storage.weight.max": safeInf(this.storage.weight.max),
        "storage.weight.mult": this.storage.weight.multiplier,
        "storage.weight.over": Number(this.storage.weight.over),
        weight: this.totalWeight,
      });
    }

    /**
     * Merge this into another group if it's consumable.
     * @returns {Promise<void>}
     */
    async groupStackDialog() {
      if (!this.consumption.enabled) { return; }
      const candidates = this._stackingCandidates;
      if (!candidates.length) { return; }
      const chosen = await DocumentSelector.selectSingle(candidates, {
        auto: true,
        hint: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.stack.hint"),
        icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.equipment.stack, "title"),
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
        updates: [{
          _id: chosen.id,
          system: { quantity: { value: chosen.system.quantity.value + this.quantity.value } },
        }],
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
      if (!this.consumption.enabled || !(amount > 0) || amount >= this.quantity.value) { return; }
      const operations = [{
        action: "create",
        data: [
          foundry.utils.mergeObject(this.parent.toObject(), {
            _id: foundry.utils.randomID(),
            system: { quantity: { value: amount } },
          }),
        ],
        documentName: "Item",
        pack: this.parent.pack,
        parent: this.parent.parent,
      }, {
        action: "update",
        documentName: "Item",
        ids: [this.getNearestDocument().id],
        pack: this.parent.pack,
        parent: this.parent.parent,
        updates: [{ _id: this.getNearestDocument().id, system: { quantity: { value: this.quantity.value - amount } } }],
      }];
      await foundry.documents.modifyBatch(operations);
    }

    /**
     * Open a dialog to split this equipment into multiple groups if it's consumable.
     * @returns {Promise<void>}
     */
    async groupUnstackDialog() {
      if (!this.consumption.enabled || !this.quantity.value) { return; }
      const content = document.createElement("div");
      const amountField = new fields.NumberField({
        hint: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.unstack.amount.hint"),
        initial: 1,
        integer: true,
        label: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.unstack.amount.label"),
        max: this.quantity.value,
        min: 0,
        nullable: false,
      });
      content.append(amountField.toFormGroup({ rootId: foundry.utils.randomID() }, { name: "amount", value: 1 }));
      await TeriockDialog.prompt({
        content,
        ok: {
          callback: async (_event, button) => {
            const amount = button.form.elements.amount.valueAsNumber || 0;
            await this.groupUnstack(amount);
          },
        },
        window: {
          icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.equipment.unstack, "title"),
          title: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.unstack.title"),
        },
      });
    }

    /** @inheritDoc */
    prepareBaseData() {
      super.prepareBaseData();
      const stored = () => (this.storage.enabled ? this.parent.previewedTypes.equipment : []);
      Object.defineProperties(this.storage.count, {
        over: { configurable: true, get: () => this.storage.count.value > this.storage.count.max },
        // Async stored equipment is assumed to have a quantity of 1
        value: {
          configurable: true,
          get: () =>
            stored().map(e => (e.system?.consumption?.enabled ? (e.system?.quantity?.value ?? 1) : 1) || 1).reduce(
              (a, b) => a + b,
              0,
            ),
        },
      });
      Object.defineProperties(this.storage.weight, {
        over: { configurable: true, get: () => this.storage.weight.value > this.storage.weight.max },
        // Async stored equipment is assumed to have a weight of 0
        value: {
          configurable: true,
          get: () =>
            stored().map(e => e.system?.totalWeight ?? 0).reduce((a, b) => a + b, 0).toNearest(
              TERIOCK.CONST.UNIT_PRECISION,
            ),
        },
      });
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      if (this.stashed || this.parent.elder?.type === "species") {
        this.weight = 0;
        this.storage.weight.multiplier = 0;
      }
    }

    /** @inheritDoc */
    prepareSpecialData() {
      super.prepareSpecialData();
      this.weight = this.weight.toNearest(TERIOCK.CONST.UNIT_PRECISION);
    }
  }

  return EquipmentStoragePart;
}
