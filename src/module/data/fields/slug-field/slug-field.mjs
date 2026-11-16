import { HTMLIdentifierInputElement } from "../../../applications/elements/_module.mjs";
import { prepareSuggestions } from "../tools/suggestions.mjs";
import { validateSlug } from "../tools/validators.mjs";

const { StringField } = foundry.data.fields;

/**
 * @import { FormInputConfig, StringFieldInputConfig, StringFieldOptions } from "@common/data/_types.mjs";
 */

/**
 * A special {@link StringField} for a {@link Slug}.
 */
export default class SlugField extends StringField {
  /** @inheritDoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, {
      blank: true,
      nullable: true,
      reset: null,
      suggestions: null,
      type: null,
      validateChoices: true,
    });
  }

  /** @inheritDoc */
  _isValidChoice(value) {
    if (!this.validateChoices) { return true; }
    return super._isValidChoice(value);
  }

  /**
   * @inheritDoc
   * @param {FormInputConfig & StringFieldInputConfig & StringFieldOptions &  Teriock.Fields._SlugFieldOptions} config
   */
  _toInput(config) {
    config.reset ??= this.reset;
    config.type ??= this.type;
    if (config.choices ?? this.choices) { return super._toInput(config); }
    config.options ??= prepareSuggestions(config.suggestions ?? this.suggestions, {
      types: config.type ? [config.type] : [],
    });
    return HTMLIdentifierInputElement.create(config);
  }

  /** @inheritDoc */
  _validateType(value) {
    if (!validateSlug(value, { strict: !this.nullable })) {
      throw new Error(_loc("TERIOCK.SYSTEMS.Identifier.FIELDS.identifier.validationError"));
    }
    return super._validateType(value);
  }

  /** @inheritDoc */
  clean(value, options, _state) {
    if (value === "") { value = null; }
    return super.clean(value, options, _state);
  }
}
