import { HTMLIdentifierInputElement } from "../../applications/elements/_module.mjs";
import { validateIdentifier } from "./tools/validators.mjs";

const { StringField } = foundry.data.fields;
const { createTextInput } = foundry.applications.fields;

/**
 * {@link StringField} for untyped identifiers.
 * @property {StringFieldOptions & Teriock.Fields._IdentifierFieldOptions} options
 */
export default class IdentifierField extends StringField {
  /** @inheritDoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, { blank: true, nullable: true, reset: null, type: null });
  }

  /**
   * @param {StringFieldOptions & Teriock.Fields._IdentifierFieldOptions} [options]
   * @param {DataFieldContext} [context]
   */
  constructor(options = {}, context = {}) {
    super(options, context);
  }

  /**
   * @inheritDoc
   * @param {FormInputConfig & StringFieldInputConfig & StringFieldOptions &  Teriock.Fields._IdentifierFieldOptions} config
   */
  _toInput(config) {
    if (config.reset && !config.choices && !config.type && !this.choices && !this.options?.type) {
      const reset = config.reset ?? this.reset;
      if (reset) { return HTMLIdentifierInputElement.create({ ...config, reset }); }
      return createTextInput(config);
    }
    return super._toInput(config);
  }

  /** @inheritDoc */
  _validateType(value) {
    if (!validateIdentifier(value, { strict: !this.nullable })) {
      throw new Error(_loc("TERIOCK.SYSTEMS.Rules.FIELDS.identifier.validationError"));
    }
    return super._validateType(value);
  }

  /** @inheritDoc */
  clean(value, options, _state) {
    if (value === "") { value = null; }
    return super.clean(value, options, _state);
  }

  /** @inheritDoc */
  initialize(value, model, options = {}) {
    const out = super.initialize(value, model, options);
    if (typeof out === "string" && this.options?.type) { return `${this.options?.type}:${out}`; }
    return out;
  }
}
