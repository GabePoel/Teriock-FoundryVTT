import { HTMLIdentifierTagsElement } from "../../applications/elements/_module.mjs";
import { validateTypedIdentifier } from "./tools/validators.mjs";

const { StringField } = foundry.data.fields;

/**
 * A special {@link StringField} for typed identifiers in the form `type:identifier`, rendered with an
 * {@link HTMLIdentifierTagsElement}.
 * @property {string[]} [types] Allowed document type prefixes.
 * @property {boolean} [single] When true, only one identifier may be attached.
 */
export default class TypedIdentifierField extends StringField {
  /** @inheritDoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, { blank: true, nullable: true, single: true, types: undefined });
  }

  /** @inheritDoc */
  _toInput(config) {
    Object.assign(config, { single: config.single ?? this.single, types: config.types ?? this.types });
    return HTMLIdentifierTagsElement.create(config);
  }

  /** @inheritDoc */
  _validateType(value) {
    if (value == null || value === "") { return true; }
    if (!validateTypedIdentifier(value, { types: this.types })) {
      const parsed = value.includes(":") ? value.split(":")[0] : null;
      if (!parsed) { throw new Error(_loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.errorRequireType")); }
      if (this.types?.length) {
        throw new Error(
          _loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.errorWrongType", {
            provided: parsed,
            required: this.types.join(", "),
          }),
        );
      }
      throw new Error(_loc("TERIOCK.SYSTEMS.Rules.FIELDS.identifier.validationError"));
    }
  }

  /** @inheritDoc */
  clean(value, options, _state) {
    if (value === "") { value = null; }
    return super.clean(value, options, _state);
  }
}
