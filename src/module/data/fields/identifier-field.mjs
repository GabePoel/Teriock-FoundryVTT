import { identifierValidator } from "./helpers/validators.mjs";

/**
 * StringField that has automatic validation for identifiers.
 * @property {boolean} allowType
 */
export default class IdentifierField extends foundry.data.fields.StringField {
  /** @inheritDoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, { allowType: false });
  }

  /** @override */
  _validateType(value) {
    if (!identifierValidator(value, { allowType: this.allowType })) {
      throw new Error(
        game.i18n.localize(
          "TERIOCK.SYSTEMS.Rules.FIELDS.identifier.validationError",
        ),
      );
    }
  }
}
