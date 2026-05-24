import { HTMLIdentifierInputElement } from "../../applications/elements/_module.mjs";
import { identifierValidator } from "./helpers/validators.mjs";

const { StringField } = foundry.data.fields;
const { createTextInput } = foundry.applications.fields;

/**
 * {@link StringField} for untyped identifiers.
 * @extends {Teriock.Fields._IdentifierFieldOptions}
 */
export default class IdentifierField extends StringField {
  /** @inheritDoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, { blank: true, nullable: true, reset: null });
  }

  /** @inheritDoc */
  _toInput(config) {
    if (!config.choices && !this.choices) {
      const reset = config.reset ?? this.reset;
      if (reset) return HTMLIdentifierInputElement.create({ ...config, reset });
      return createTextInput(config);
    }
    return super._toInput(config);
  }

  /** @inheritDoc */
  _validateType(value) {
    if (value == null || value === "") return true;
    if (!identifierValidator(value)) throw new Error(_loc("TERIOCK.SYSTEMS.Rules.FIELDS.identifier.validationError"));
  }

  /** @inheritDoc */
  clean(value, options, _state) {
    if (value === "") value = null;
    return super.clean(value, options, _state);
  }
}
