import { HTMLIdentifierTagsElement } from "../../applications/elements/_module.mjs";
import { identifierValidator } from "./helpers/validators.mjs";

const { StringField } = foundry.data.fields;

/**
 * {@link StringField} with automatic validation for Teriock identifiers.
 * @extends {Teriock.Fields._IdentifierFieldOptions}
 */
export default class IdentifierField extends StringField {
  /** @inheritDoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, {
      allowType: false,
      blank: true,
      nullable: true,
      reset: null,
      type: undefined,
    });
  }

  /** @inheritDoc */
  _toInput(config) {
    Object.assign(config, {
      allowType: this.allowType,
      reset: config.reset ?? this.reset,
      single: true,
      type: this.type,
    });
    return HTMLIdentifierTagsElement.create(config);
  }

  /** @inheritDoc */
  _validateType(value) {
    if (value == null || value === "") {
      return true;
    }
    if (!identifierValidator(value, { allowType: this.allowType })) {
      throw new Error(_loc("TERIOCK.SYSTEMS.Rules.FIELDS.identifier.validationError"));
    }
    if (this.type) {
      const type = value.includes(":") ? value.split(":")[0] : null;
      if (type !== this.type) {
        throw new Error(
          _loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.errorWrongType", { provided: type ?? value, required: this.type }),
        );
      }
    }
  }

  /** @inheritDoc */
  clean(value, options, _state) {
    if (value === "") {
      value = null;
    }
    return super.clean(value, options, _state);
  }
}
