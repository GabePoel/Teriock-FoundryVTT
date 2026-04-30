import { EvaluationModel } from "../models/_module.mjs";

const { EmbeddedDataField } = foundry.data.fields;

export default class EvaluationField extends EmbeddedDataField {
  /**
   * @param {StringFieldOptions & Teriock.Fields._EvaluationFieldOptions} [options] - Options which
   * configure the behavior of the field.
   * @param {DataFieldContext} [context] - Additional context which describes the field.
   */
  constructor(options = {}, context = {}) {
    const model = options.model ?? EvaluationModel;
    delete options.model;
    const evaluationOptions = foundry.utils.deepClone(options);
    delete evaluationOptions.initial;
    if (typeof options.initial === "number") {
      options.initial = options.initial.toString();
    }
    super(model, evaluationOptions, context);
    this.fields = this._initialize(model.defineSchema(options));
    this._derivationOptions = options;
  }

  /** @type {StringFieldOptions & Teriock.Fields._EvaluationFieldOptions} */
  _derivationOptions;

  /** @inheritDoc */
  applyChange(value, model, change, options) {
    if (["string", "number"].includes(typeof change.value)) {
      const field = this.fields.raw;
      value.raw = field.applyChange(value.raw, model, change, options);
      return value;
    }
    return super.applyChange(value, model, change, options);
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
