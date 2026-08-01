const { JSONField } = foundry.data.fields;
const { Roll } = foundry.dice;

/**
 * Special case JSONField that initializes to a {@link BaseRoll} (or whatever).
 */
export default class RollField extends JSONField {
  /** @inheritdoc */
  _cast(value) {
    if (value instanceof Roll) { return value.toJSON(); }
    return super._cast(value);
  }

  /** @inheritdoc */
  _validateType(value, options) {
    const roll = JSON.parse(value);
    if (!roll.evaluated) { throw new Error("RollField objects must be evaluated"); }
    return super._validateType(value, options);
  }

  /** @inheritdoc */
  initialize(value, model, options = {}) {
    return Roll.fromData(super.initialize(value, model, options));
  }

  /** @inheritdoc */
  toObject(value) {
    if (value instanceof Roll) { return value.toJSON(); }
    return super.toObject(value);
  }
}
