import { EvaluationModel } from "../../models/_module.mjs";

const { EmbeddedDataField } = foundry.data.fields;

export default class EvaluationField extends EmbeddedDataField {
  /**
   * @param {StringFieldOptions & Teriock.Fields._EvaluationFieldOptions} [options] - Options which
   * configure the behavior of the field.
   * @param {DataFieldContext} [context] - Additional context which describes the field.
   */
  constructor(options = {}, context = {}) {
    const model = EvaluationModel;
    super(model, options, context);
    this.fields = this._initialize(model.defineSchema(options));
    this._derivationOptions = options;
  }

  /** @type {Teriock.Fields.FormulaDerivationOptions} */
  _derivationOptions;

  /** @inheritDoc */
  clean(value, options) {
    if (typeof value !== "object") {
      value = { raw: value };
    }
    if (typeof value.saved !== "undefined") {
      value.raw = value.saved;
      delete value.saved;
    }
    if (typeof value.raw === "undefined") {
      value.raw = "";
    }
    value.raw = `${value.raw}`;
    return super.clean(value, options);
  }

  /** @inheritDoc */
  initialize(value, model, options = {}) {
    const newOptions = {
      ...options,
      ...this._derivationOptions,
    };
    return super.initialize(value, model, newOptions);
  }

  /** @inheritDoc */
  toFormGroup(groupConfig = {}, inputConfig = {}) {
    return this.fields.raw.toFormGroup(groupConfig, inputConfig);
  }

  /** @inheritDoc */
  toInput(config) {
    return this.fields.raw.toInput(config);
  }
}
