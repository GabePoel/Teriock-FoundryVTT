const { SchemaField } = foundry.data.fields;
const { getProperty, setProperty } = foundry.utils;

/**
 * A special class of {@link SchemaField} which applies its changes to multiple paths in its data schema.
 */
export default class MultiChangeField extends SchemaField {
  /** @inheritDoc */
  static get _defaults() {
    return Object.assign(super._defaults, { multiChangePaths: null });
  }

  /** @inheritDoc */
  applyChange(value, model, change, options = { replacementData: {} }) {
    const entries = this.multiChangePaths
      ? this.multiChangePaths.map(p => [p, this.getField(p)])
      : Object.entries(this.fields);
    for (const [path, field] of entries) {
      if (!field) { continue; }
      const changed = field.applyChange(getProperty(value, path), model, change, options);
      setProperty(value, path, changed);
    }
    return value;
  }
}
