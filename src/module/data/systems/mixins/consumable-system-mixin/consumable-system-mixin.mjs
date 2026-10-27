import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { asInf, mergeMetadata, safeInf } from "../../../../utils/_module.mjs";
import { FormulaField, InfiniteNumberField } from "../../../fields/_module.mjs";
import { migrateRename } from "../../../fields/tools/migrations.mjs";
import { documentSettingsModels } from "../../../models/_module.mjs";

const { fields } = foundry.data;

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function ConsumableSystemMixin(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.ConsumableSystemData}
   */
  class ConsumableSystem extends /** @type {InitializedDataModel<T, Teriock.Models.ConsumableSystemData>} */ (Base) {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Consumable"];

    /** @inheritDoc */
    static metadata = mergeMetadata(super.metadata, {
      automationTags: { consumable: true },
      preserveOnRefresh: ["system.consumption.enabled", "system.quantity.value", ...super.metadata.preserveOnRefresh],
      tags: { consumable: true },
    });

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        consumption: new fields.SchemaField({
          amount: new fields.NumberField({ initial: 1, integer: true, nullable: false, placeholder: "1" }),
          enabled: new fields.BooleanField({ initial: this.metadata.initialConsumable }),
        }),
        quantity: new fields.SchemaField({
          max: new InfiniteNumberField({ persisted: false }),
          maxFormula: new FormulaField({ deterministic: true, placeholder: TERIOCK.CONST.INF_CODE }),
          min: new fields.NumberField({ initial: 0, integer: true, persisted: false }),
          value: new fields.NumberField({ initial: 1, integer: true, nullable: false, placeholder: "1" }),
        }),
        settings: new fields.EmbeddedDataField(documentSettingsModels.consumable),
      });
    }

    /** @inheritDoc */
    static migrateData(source, options) {
      migrateRename(source, "consumptionAmount", "consumption.amount");
      migrateRename(source, "consumable", "consumption.enabled");
      return super.migrateData(source, options);
    }

    /** @returns {Teriock.Panels.PanelBar} */
    get _consumableBar() {
      return {
        icon: TERIOCK.DISPLAY.icons.manifest.ui.quantity,
        label: _loc("TERIOCK.SYSTEMS.Consumable.FIELDS.quantity.value.label"),
        wrappers: [
          _loc("TERIOCK.SYSTEMS.Consumable.EMBED.remaining", { value: this.quantity.value }),
          _loc("TERIOCK.SYSTEMS.Consumable.PANELS.max", { value: asInf(this.quantity.max) }),
          _loc("TERIOCK.SYSTEMS.Consumable.EMBED.perUse", { value: this.consumption.amount }),
        ],
      };
    }

    /** @inheritDoc */
    get _embedActions() {
      return Object.assign(super._embedActions, {
        useOneDoc: { primary: async () => await this.useOne(), secondary: async () => await this.gainOne() },
      });
    }

    /** @inheritDoc */
    get embedParts() {
      const parts = super.embedParts;
      if (this.consumption.enabled) {
        parts.subtitleAction = "useOneDoc";
        parts.subtitleTooltip = _loc("TERIOCK.SYSTEMS.Consumable.EMBED.consumeOne");
        parts.subtitle = this.remainingString;
      }
      return parts;
    }

    /**
     * A string representing how many of these are remaining.
     * @returns {string}
     */
    get remainingString() {
      return this.quantity.max === Infinity
        ? _loc("TERIOCK.SYSTEMS.Consumable.EMBED.remaining", { value: this.quantity.value })
        : _loc("TERIOCK.SYSTEMS.Consumable.EMBED.remainingMax", { max: this.quantity.max, value: this.quantity.value });
    }

    /** @inheritDoc */
    _getTipSuppressions() {
      return Object.assign({ consumed: this._isSuppressedConsumed.bind(this) }, super._getTipSuppressions());
    }

    /**
     * If this is suppressed due to being consumed.
     * @returns {boolean}
     */
    _isSuppressedConsumed() {
      return this.consumption.enabled && this.quantity.value === 0;
    }

    /**
     * Adds one unit to the consumable item.
     * Increments the quantity by 1, respecting maximum quantity limits.
     * @returns {Promise<void>}
     */
    async gainOne() {
      if (this.consumption.enabled) {
        await this.parent.update({
          "system.quantity.value": Math.clamp(this.quantity.value + 1, this.quantity.min, this.quantity.max),
        });
      }
    }

    /** @inheritDoc */
    getLocalRollData() {
      return Object.assign(super.getLocalRollData(), {
        consumable: Number(this.consumption.enabled),
        max: safeInf(this.quantity.max),
        quantity: this.quantity.value,
        "quantity.max": safeInf(this.quantity.max),
      });
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      if (this.consumption.enabled) {
        this.quantity.max = this.quantity.maxFormula
          ? Math.max(0, Math.floor(BaseRoll.minValue(this.quantity.maxFormula, this.getRollData())))
          : Infinity;
        this.quantity.value = Math.clamp(this.quantity.value, this.quantity.min, this.quantity.max);
      } else {
        this.quantity.max = 1;
        this.quantity.value = 1;
      }
    }

    /**
     * Consumes one unit of the consumable item.
     * Decrements the quantity by 1, ensuring it doesn't go below 0.
     * @returns {Promise<void>}
     */
    async useOne() {
      if (this.consumption.enabled && this.consumption.amount) {
        await this.parent.update({ "system.quantity.value": Math.max(0, this.quantity.value - 1) });
      }
    }
  }

  return ConsumableSystem;
}
