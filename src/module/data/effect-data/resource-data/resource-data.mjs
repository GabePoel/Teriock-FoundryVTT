import { mergeFreeze } from "../../../helpers/utils.mjs";
import { ConsumableDataMixin } from "../../mixins/_module.mjs";
import { FormulaField } from "../../shared/fields/_module.mjs";
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _migrateData } from "./methods/_migrate-data.mjs";
import { _roll } from "./methods/_rolling.mjs";

const { fields } = foundry.data;

/**
 * Resource-specific effect data model.
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockResourceData extends ConsumableDataMixin(
  TeriockBaseEffectData,
) {
  /**
   * @inheritDoc
   * @type {Readonly<Teriock.Documents.EffectModelMetadata>}
   */
  static metadata = mergeFreeze(super.metadata, {
    type: "resource",
    usable: true,
  });

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      consumable: new fields.BooleanField({
        initial: true,
        label: "Consumable",
      }),
      quantity: new fields.NumberField({
        initial: 1,
        integer: true,
        label: "Quantity",
        min: 0,
        nullable: true,
      }),
      maxQuantity: new fields.SchemaField({
        raw: new FormulaField({
          label: "Max Quantity (Raw)",
          initial: "",
          deterministic: true,
        }),
        derived: new fields.NumberField({
          initial: 0,
          integer: true,
          label: "Max Quantity (Derived)",
          min: 0,
        }),
      }),
      rollFormula: new FormulaField({
        initial: "",
        label: "Roll Formula",
        deterministic: false,
      }),
      functionHook: new fields.StringField({
        initial: "none",
        label: "Function Hook",
      }),
    });
  }

  /** @inheritDoc */
  static migrateData(data) {
    data = _migrateData(data);
    return super.migrateData(data);
  }

  /** @inheritDoc */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }

  /** @inheritDoc */
  get suppressed() {
    let suppressed = super.suppressed;
    if (!suppressed && this.parent?.parent?.type === "equipment") {
      suppressed = !this.parent.parent.system.isAttuned;
    }
    return suppressed;
  }

  /** @inheritDoc */
  async gainOne() {
    await super.gainOne();
    await this.parent.enable();
  }

  /** @inheritDoc */
  async roll(options) {
    await _roll(this, options);
  }

  /** @inheritDoc */
  async useOne() {
    const toDisable = this.quantity <= 1;
    await super.useOne();
    if (toDisable) {
      await this.parent.disable();
    }
  }
}
