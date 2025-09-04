import { TeriockRoll } from "../../../dice/_module.mjs";

const { StringField } = foundry.data.fields;

/**
 * Special case {@link StringField} which represents a formula.
 * @param {StringFieldOptions & { deterministic?: boolean; }} [options={}] - Options which configure field behavior.
 * @property {boolean} deterministic=false - Is this formula not allowed to have dice values?
 */
export default class FormulaField extends StringField {
  /** @inheritdoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, {
      required: true,
      deterministic: false,
    });
  }

  /** @override */
  _applyChangeAdd(value, delta, _model, _change) {
    if (!value) return delta;
    const operator = delta.startsWith("-") ? "-" : "+";
    delta = delta.replace(/^[+-]/, "").trim();
    return `${value} ${operator} ${delta}`;
  }

  /** @override */
  _applyChangeDowngrade(value, delta, _model, _change) {
    if (!value) return delta;
    const terms = new TeriockRoll(value, {}).terms;
    if (terms.length === 1 && terms[0]?.fn === "min")
      return value.replace(/\)$/, `, ${delta})`);
    return `min(${value}, ${delta})`;
  }

  /** @override */
  _applyChangeMultiply(value, delta, _model, _change) {
    if (!value) return delta;
    const terms = new TeriockRoll(value, {}).terms;
    if (terms.length > 1) return `(${value}) * ${delta}`;
    return `${value} * ${delta}`;
  }

  /** @override */
  _applyChangeUpgrade(value, delta, _model, _change) {
    if (!value) return delta;
    const terms = new TeriockRoll(value, {}).terms;
    if (terms.length === 1 && terms[0]?.fn === "max")
      return value.replace(/\)$/, `, ${delta})`);
    return `max(${value}, ${delta})`;
  }

  /** @override */
  _castChangeDelta(delta) {
    return this._cast(delta).trim();
  }

  /** @inheritdoc */
  _validateType(value) {
    if (this.deterministic) {
      const roll = new TeriockRoll(value, {});
      if (!roll.isDeterministic) throw new Error("must not contain dice terms");
    }
    super._validateType(value);
  }
}
