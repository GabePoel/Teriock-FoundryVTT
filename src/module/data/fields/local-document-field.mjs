const { DocumentIdField } = foundry.data.fields;

/**
 * Blatantly stolen from D&D 5E with some extra bells and whistles added.
 * A mirror of ForeignDocumentField that references a Document embedded within this Document.
 * @property {StringFieldOptions & Teriock.Fields._LocalDocumentFieldOptions} options
 */
export default class LocalDocumentField extends DocumentIdField {
  /** @inheritDoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, {
      fallback: false,
      idOnly: false,
      nullable: true,
      readonly: false,
    });
  }

  /**
   * @param {typeof Document} model - The local DataModel class definition which this field should link to.
   * @param {StringFieldOptions & Teriock.Fields._LocalDocumentFieldOptions} [options] - Options which configure the
   * behavior of the field.
   */
  constructor(model, options = {}) {
    if (!foundry.utils.isSubclass(model, foundry.abstract.DataModel)) {
      throw new Error("A LocalDocumentField must specify a DataModel subclass as its type.");
    }
    super(options);
    this.model = model;
  }

  /**
   * A reference to the model class which is stored in this field.
   * @type {typeof Document}
   */
  model;

  /** @inheritDoc */
  _cast(value) {
    if (typeof value === "string") { return value; }
    if (value instanceof this.model) { return value._id; }
    throw new Error(`The value provided to a LocalDocumentField must be a ${this.model.name} instance.`);
  }

  /**
   * Step up through model's parents to find the specified collection.
   * @param {TeriockActiveEffect|TeriockActor|TeriockItem} model
   * @param {string} collection
   * @returns {DocumentCollection|null}
   */
  _findCollection(model, collection) {
    if (!model.parent) { return null; }
    try {
      return model.parent.getEmbeddedCollection(collection);
    } catch {
      return model.parent[collection] ?? this._findCollection(model.parent, collection);
    }
  }

  /** @inheritDoc */
  _validateType(value) {
    if (!this.options?.fallback) { super._validateType(value); }
  }

  /** @inheritDoc */
  initialize(value, model, _options = {}) {
    if (this.idOnly) { return this.options?.fallback || foundry.data.validators.isValidId(value) ? value : null; }
    const collection = this._findCollection(model, this.model.metadata.collection);
    return () => {
      const document = collection?.get(value);
      if (!document) { return this.options?.fallback ? value : null; }
      if (this.options?.fallback) {
        Object.defineProperty(document, "toString", {
          configurable: true,
          enumerable: false,
          value: () => document.name,
        });
      }
      if (this.options?.nullify && this.options.nullify(document)) { return null; }
      return document;
    };
  }

  /** @inheritDoc */
  toObject(value) {
    return value?._id ?? value;
  }
}
