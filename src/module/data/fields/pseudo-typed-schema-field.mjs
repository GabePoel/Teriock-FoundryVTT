const { TypedSchemaField } = foundry.data.fields;

export default class PseudoTypedSchemaField extends TypedSchemaField {
  /** @inheritdoc */
  _validateSpecial(value) {
    if (!value || value.type in this.types)
      return super._validateSpecial(value);
    return true;
  }
}
