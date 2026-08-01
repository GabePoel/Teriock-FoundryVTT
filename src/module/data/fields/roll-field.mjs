const { JSONField } = foundry.data.fields;
const { Roll } = foundry.dice;

/**
 * Special case JSONField that initializes to a {@link BaseRoll} (or whatever).
 */
export default class RollField extends JSONField {
  /** @inheritdoc */
  _cast(value) {
    if (value instanceof Roll) { return JSON.stringify(value); }
    return super._cast(value);
  }

  /** @inheritdoc */
  _validateType(value, options) {
    super._validateType(value, options);
    if (!JSON.parse(value)?.evaluated) { throw new Error("RollField objects must be evaluated"); }
  }

  /** @inheritdoc */
  initialize(value, model, options = {}) {
    const data = super.initialize(value, model, options);
    if (!data) { return data; }
    try {
      return Roll.fromData(data);
    } catch (err) {
      console.error("Invalid roll data", err);
      return null;
    }
  }

  /** @inheritdoc */
  toObject(value) {
    if (value instanceof Roll) { return JSON.stringify(value); }
    return super.toObject(value);
  }
}
