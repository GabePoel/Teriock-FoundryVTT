import { identifierValidator } from "./helpers/validators.mjs";

const { StringField } = foundry.data.fields;

/**
 * StringField that has automatic validation for identifiers.
 * @property {boolean} allowType
 */
export default class IdentifierField extends StringField {
  /** @inheritDoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, { allowType: false });
  }

  /** @override */
  _validateType(value) {
    if (!identifierValidator(value, { allowType: this.allowType })) {
      throw new Error(_loc("TERIOCK.SYSTEMS.Rules.FIELDS.identifier.validationError"));
    }
  }
}
