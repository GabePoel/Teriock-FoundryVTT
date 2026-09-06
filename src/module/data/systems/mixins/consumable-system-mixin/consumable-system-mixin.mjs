import systemConfig from "../../../../constants/config/system-config.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { asInf } from "../../../../helpers/icon.mjs";
import { FormulaField, InfiniteNumberField } from "../../../fields/_module.mjs";
import { documentSettingsModels } from "../../../models/_module.mjs";
import { ChangeQuantityAutomation } from "../../../pseudo-documents/automations/_module.mjs";

const { fields } = foundry.data;

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ConsumableSystem & Teriock.Models.ConsumableSystemData>}
 */
export default function ConsumableSystemMixin(Base) {
  /**
   * @implements {Teriock.Models.ConsumableSystemData}
   * @mixin
   */
  class ConsumableSystem extends Base {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Consumable"];

    /** @inheritDoc */
    static PRESERVED_PROPERTIES = ["system.consumable", "system.quantity.value", ...super.PRESERVED_PROPERTIES];

    /** @inheritDoc */
    static get _automationTypes() {
      return [...super._automationTypes, ChangeQuantityAutomation];
    }

    /** @inheritDoc */
    static get metadata() {
      return foundry.utils.mergeObject(super.metadata, { consumable: true });
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        consumable: new fields.BooleanField({ initial: true }),
        consumptionAmount: new fields.NumberField({ initial: 1, integer: true, nullable: false, placeholder: "1" }),
        quantity: new fields.SchemaField({
          max: new InfiniteNumberField({ persisted: false }),
          maxFormula: new FormulaField({ deterministic: true, placeholder: systemConfig.infCode }),
          min: new fields.NumberField({ initial: 0, integer: true, persisted: false }),
          value: new fields.NumberField({ initial: 1, integer: true, nullable: false, placeholder: "0" }),
        }),
        settings: new fields.EmbeddedDataField(documentSettingsModels.consumable),
      });
    }

    /** @returns {Teriock.Panels.PanelBar} */
    get _consumableBar() {
      return {
        icon: TERIOCK.display.icons.manifest.ui.quantity,
        label: _loc("TERIOCK.SYSTEMS.Consumable.FIELDS.quantity.value.label"),
        wrappers: [
          _loc("TERIOCK.SYSTEMS.Consumable.EMBED.remaining", { value: this.quantity.value }),
          _loc("TERIOCK.SYSTEMS.Consumable.PANELS.max", { value: asInf(this.quantity.max) }),
          _loc("TERIOCK.SYSTEMS.Consumable.EMBED.perUse", { value: this.consumptionAmount }),
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
      if (this.consumable) {
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
      return this.consumable && this.quantity.value === 0;
    }

    /**
     * Adds one unit to the consumable item.
     * Increments the quantity by 1, respecting maximum quantity limits.
     * @returns {Promise<void>}
     */
    async gainOne() {
      if (this.consumable) {
        await this.parent.update({
          "system.quantity.value": Math.clamp(this.quantity.value + 1, this.quantity.min, this.quantity.max),
        });
      }
    }

    /** @inheritDoc */
    getLocalRollData() {
      return Object.assign(super.getLocalRollData(), {
        consumable: Number(this.consumable),
        max: Math.min(this.quantity.max, TERIOCK.config.system.safeInf),
        quantity: this.quantity.value,
        "quantity.max": Math.min(this.quantity.max, TERIOCK.config.system.safeInf),
      });
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      if (this.consumable) {
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
      if (this.consumable && this.consumptionAmount) {
        await this.parent.update({ "system.quantity.value": Math.max(0, this.quantity.value - 1) });
      }
    }
  }

  return ConsumableSystem;
}
