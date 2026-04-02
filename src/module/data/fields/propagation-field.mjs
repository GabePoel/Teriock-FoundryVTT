const { SchemaField } = foundry.data.fields;
const { getProperty, setProperty } = foundry.utils;

/**
 * A special class of {@link SchemaField} which applies its changes to each path in its data schema.
 * @property {DataFieldOptions & Teriock.Fields._PropagationFieldOptions} options
 */
export default class PropagationField extends SchemaField {
  /**
   * @param {DataSchema} fields
   * @param {DataFieldOptions & Teriock.Fields._PropagationFieldOptions} [options]
   * @param {DataFieldContext} [context]
   */
  constructor(fields, options, context = {}) {
    super(fields, options, context);
    this.propagationPaths = options.propagationPaths;
  }

  /** @type {string[] | undefined} */
  propagationPaths;

  /** @inheritDoc */
  applyChange(value, model, change, options = { replacementData: {} }) {
    const entries = this.propagationPaths
      ? this.propagationPaths.map((p) => [p, this.getField(p)])
      : Object.entries(this.fields);
    for (const [path, field] of entries) {
      if (!field) continue;
      const changed = field.applyChange(
        getProperty(value, path),
        model,
        change,
        options,
      );
      setProperty(value, path, changed);
    }
    return value;
  }
}
