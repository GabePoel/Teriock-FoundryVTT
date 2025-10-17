import { TeriockRoll } from "../../../dice/_module.mjs";

const { StringField } = foundry.data.fields;

/**
 * Special case {@link StringField} which represents a formula.
 */
export default class FormulaField extends StringField {
  /**
   * @param {StringFieldOptions & Teriock.Fields._FormulaFieldOptions} [options] - Options which configure
   * the behavior of the field.
   * @param {DataFieldContext} [context] - Additional context which describes the field.
   */
  constructor(options = {}, context = {}) {
    super(options, context);
  }

  /** @inheritdoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, {
      required: true,
      deterministic: false,
    });
  }

  /** @inheritDoc */
  _applyChangeAdd(value, delta, _model, _change) {
    if (!value) {
      return delta;
    }
    const operator = delta.startsWith("-") ? "-" : "+";
    delta = delta.replace(/^[+-]/, "").trim();
    return `${value} ${operator} ${delta}`;
  }

  /** @inheritDoc */
  _applyChangeDowngrade(value, delta, _model, _change) {
    if (!value) {
      return delta;
    }
    if (this.deterministic) {
      const terms = new TeriockRoll(value, {}).terms;
      if (terms.length === 1 && terms[0]?.fn === "min") {
        return value.replace(/\)$/, `, ${delta})`);
      }
      return `min(${value}, ${delta})`;
    }
    const valueTotal = TeriockRoll.meanValue(value);
    const deltaTotal = TeriockRoll.meanValue(delta);
    if (deltaTotal <= valueTotal) {
      return delta;
    } else {
      return value;
    }
  }

  /** @inheritDoc */
  _applyChangeMultiply(value, delta, _model, _change) {
    if (!value) {
      return delta;
    }
    const terms = new TeriockRoll(value, {}).terms;
    if (terms.length > 1) {
      return `(${value}) * ${delta}`;
    }
    return `${value} * ${delta}`;
  }

  /** @inheritDoc */
  _applyChangeUpgrade(value, delta, _model, _change) {
    if (!value) {
      return delta;
    }
    if (this.deterministic) {
      const terms = new TeriockRoll(value, {}).terms;
      if (terms.length === 1 && terms[0]?.fn === "max") {
        return value.replace(/\)$/, `, ${delta})`);
      }
      return `max(${value}, ${delta})`;
    }
    const valueTotal = TeriockRoll.meanValue(value);
    const deltaTotal = TeriockRoll.meanValue(delta);
    if (deltaTotal >= valueTotal) {
      return delta;
    } else {
      return value;
    }
  }

  /** @inheritDoc */
  _castChangeDelta(delta) {
    return this._cast(delta).trim();
  }

  /** @inheritdoc */
  _validateType(value) {
    if (this.deterministic) {
      const roll = new TeriockRoll(value, {});
      if (!roll.isDeterministic) {
        throw new Error("must not contain dice terms");
      }
    }
    super._validateType(value);
  }
}
