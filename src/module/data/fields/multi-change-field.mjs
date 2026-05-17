const { SchemaField } = foundry.data.fields;
const { getProperty, setProperty } = foundry.utils;

/**
 * A special class of {@link SchemaField} which applies its changes to multiple paths in its data schema.
 * @property {DataFieldOptions & Teriock.Fields._MultiChangeFieldOptions} options
 */
export default class MultiChangeField extends SchemaField {
  /**
   * @param {DataSchema} fields
   * @param {DataFieldOptions & Teriock.Fields._MultiChangeFieldOptions} [options]
   * @param {DataFieldContext} [context]
   */
  constructor(fields, options, context = {}) {
    super(fields, options, context);
    this.multiChangePaths = options.multiChangePaths;
  }

  /** @type {string[] | undefined} */
  multiChangePaths;

  /** @inheritDoc */
  applyChange(value, model, change, options = { replacementData: {} }) {
    const entries = this.multiChangePaths
      ? this.multiChangePaths.map(p => [p, this.getField(p)])
      : Object.entries(this.fields);
    for (const [path, field] of entries) {
      if (!field) {
        continue;
      }
      const changed = field.applyChange(getProperty(value, path), model, change, options);
      setProperty(value, path, changed);
    }
    return value;
  }
}
