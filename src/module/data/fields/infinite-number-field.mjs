import systemConfig from "../../constants/config/system-config.mjs";

const { NumberField } = foundry.data.fields;

/**
 * Slightly modified {@link NumberField} that treats `null` as (positive) `Infinity`.
 * @inheritDoc
 */
export default class InfiniteNumberField extends NumberField {
  /** @inheritdoc */
  static get _defaults() {
    return Object.assign(super._defaults, {
      initial: null,
      integer: false,
      min: 0,
      nullable: true,
      placeholder: systemConfig.infCode,
      required: true,
    });
  }

  /** @inheritDoc */
  _castChangeDelta(raw, replacementData) {
    if (this.nullable && ((typeof raw === "string" && raw.trim() === "null") || raw === null)) { return Infinity; }
    return super._castChangeDelta(raw, replacementData);
  }

  /** @inheritDoc */
  _validateType(value, options) {
    if (value === Infinity) { return true; }
    super._validateType(value, options);
  }

  /** @inheritDoc */
  initialize(value, model, options = {}) {
    if (value === null) { return Infinity; }
    return super.initialize(value, model, options);
  }
}
