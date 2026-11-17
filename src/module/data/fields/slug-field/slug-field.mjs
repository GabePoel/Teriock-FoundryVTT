import { HTMLSlugInputElement, HTMLSlugTagsElement } from "../../../applications/elements/_module.mjs";
import { prepareSuggestions } from "../tools/suggestions.mjs";
import { validateSlug } from "../tools/validators.mjs";

const { StringField } = foundry.data.fields;

/**
 * @import { FormInputConfig, StringFieldInputConfig, StringFieldOptions } from "@common/data/_types.mjs";
 */

/**
 * A special {@link StringField} for a {@link Slug}.
 * @category Identifiers
 */
export default class SlugField extends StringField {
  /** @inheritDoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, {
      blank: true,
      generate: null,
      nullable: true,
      suggestions: null,
      types: undefined,
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
    config.generate ??= this.generate;
    if (config.choices ?? this.choices) { return super._toInput(config); }
    config.options ??= prepareSuggestions(config.suggestions ?? this.suggestions, {
      types: config.types ?? this.types ?? [],
    });
    if (config.single === false) { return HTMLSlugTagsElement.create(config); }
    return HTMLSlugInputElement.create(config);
  }

  /** @inheritDoc */
  _validateType(value) {
    if (!validateSlug(value, { strict: !this.nullable })) {
      throw new Error(_loc("TERIOCK.SYSTEMS.Identifier.FIELDS.slug.validationError"));
    }
    return super._validateType(value);
  }

  /** @inheritDoc */
  clean(value, options, _state) {
    if (value === "") { value = null; }
    return super.clean(value, options, _state);
  }
}
