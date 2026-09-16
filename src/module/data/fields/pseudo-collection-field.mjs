import { BasePseudoDocument } from "../pseudo-documents/abstract/_module.mjs";
import { PseudoCollection, SourcePseudoCollection } from "../pseudo-documents/collections/_module.mjs";

const { TypedObjectField, TypedSchemaField } = foundry.data.fields;

/**
 * @import { DataFieldContext, DataFieldOptions } from "@common/data/_types.mjs";
 */

class PseudoTypedSchemaField extends TypedSchemaField {
  /** @inheritDoc */
  _migrate(value, options, state) {
    if (!options.partial && foundry.utils.isPlainObject(value)) { value.type ??= "base"; }
    return super._migrate(value, options, state);
  }

  /** @inheritdoc */
  _validateSpecial(value) {
    if (!value || value.type in this.types) { return super._validateSpecial(value); }
    return true;
  }
}

export default class PseudoCollectionField extends TypedObjectField {
  /** @inheritDoc */
  static hierarchical = true;

  /** @inheritDoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, { validateKey: foundry.data.validators.isValidId });
  }

  /**
   * @param {typeof BasePseudoDocument} model
   * @param {DataFieldOptions} [options]
   * @param {Record<string, typeof BasePseudoDocument>} [options.types]
   * @param {DataFieldContext} [context]
   */
  constructor(model, options = {}, context = {}) {
    if (!foundry.utils.isSubclass(model, BasePseudoDocument)) {
      throw new Error(_loc("TERIOCK.FIELDS.PseudoCollectionField.notPseudoDocument"));
    }
    options.types ??= model.TYPE_MODELS;
    super(new PseudoTypedSchemaField(options.types), options, context);
    this.#documentClass = model;
  }

  /**
   * The pseudo-document class.
   * @type {typeof BasePseudoDocument}
   */
  #documentClass;

  /**
   * The pseudo-document class.
   * @returns {typeof BasePseudoDocument}
   */
  get documentClass() {
    return this.#documentClass;
  }

  /**
   * The name of the pseudo-document class.
   * @returns {string}
   */
  get documentName() {
    return this.documentClass.metadata.documentName;
  }

  /**
   * The Collection implementation to use when initializing the collection.
   * @returns {typeof PseudoCollection}
   */
  get implementation() {
    return this.persisted ? SourcePseudoCollection : PseudoCollection;
  }

  /** @inheritDoc */
  _cast(value) {
    if (value instanceof Map) { value = Array.from(value.values()); }
    if (!Array.isArray(value)) { return super._cast(value); }
    const object = {};
    for (let entry of value) {
      if (!entry) { continue; }
      if (typeof entry.toObject === "function") { entry = entry.toObject(); }
      if (!foundry.utils.isPlainObject(entry)) { continue; }
      entry._id ||= foundry.utils.randomID();
      object[entry._id] = entry;
    }
    return object;
  }

  /** @inheritDoc */
  initialize(_value, model, options = {}) {
    const controller = model instanceof BasePseudoDocument ? model : model.document;
    const collection = controller?.pseudoCollections?.[this.documentName] ?? null;
    collection?.initialize(model, options);
    return collection;
  }

  /** @inheritDoc */
  toObject(value) {
    if (!value) { return value; }
    return Array.from(value.values(), pseudo => this.element.toObject(pseudo));
  }
}
