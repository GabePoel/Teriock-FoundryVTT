import BaseAffinity from "./base-affinity.mjs";

const { fields } = foundry.data;

/**
 * An affinity that contributes an amount rather than simply being present, and so adds up across every source that
 * grants it.
 * @extends {BaseAffinity}
 * @property {number} amount
 */
export default class StackingAffinity extends BaseAffinity {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AFFINITIES.Stacking"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      amount: new fields.NumberField({ initial: 1, integer: true, min: 1, nullable: false, required: true }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, "amount"];
  }

  /** @inheritDoc */
  getAmount() {
    return this.amount;
  }
}
