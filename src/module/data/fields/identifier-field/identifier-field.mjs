import { HTMLAutocompleteInputElement, HTMLIdentifierInputElement } from "../../../applications/elements/_module.mjs";
import { validateIdentifier } from "../tools/validators.mjs";

const { StringField } = foundry.data.fields;

/**
 * @import { DataFieldContext, FormInputConfig, StringFieldInputConfig, StringFieldOptions } from "@common/data/_types.mjs";
 */

/**
 * {@link StringField} for untyped identifiers.
 */
export default class IdentifierField extends StringField {
  /** @inheritDoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, {
      autocomplete: false,
      blank: true,
      nullable: true,
      reset: null,
      suggestions: null,
      type: null,
    });
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
    config.autocomplete ??= this.autocomplete;
    config.type ??= this.type;
    config.reset ??= this.reset;
    config.choices ??= this.choices ?? this.suggestions
      ?? ((config.autocomplete && config.type) ? game.teriock.identifiers.getNames(config.type) : undefined);
    if (config.autocomplete && config.choices) {
      this.constructor._prepareChoiceConfig(config);
      return HTMLAutocompleteInputElement.create(config);
    }
    if (config.reset && !config.type) {
      this.constructor._prepareChoiceConfig(config);
      return HTMLIdentifierInputElement.create(config);
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
