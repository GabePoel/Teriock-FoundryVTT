import { TypeCollection } from "../../documents/collections/_module.mjs";
import { TypedPseudoDocument } from "../pseudo-documents/abstract/_module.mjs";
import PseudoTypedSchemaField from "./pseudo-typed-schema-field.mjs";

const { TypedObjectField } = foundry.data.fields;

export default class PseudoCollectionField extends TypedObjectField {
  /** @inheritDoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, { validateKey: foundry.data.validators.isValidId });
  }

  /**
   * @param {typeof TypedPseudoDocument} model
   * @param {DataFieldOptions & Partial<{ collection: typeof TypeCollection}>} [options]
   * @param {Record<string, typeof TypedPseudoDocument>} [options.types]
   * @param {DataFieldContext} [context]
   */
  constructor(model, options = {}, context = {}) {
    if (!foundry.utils.isSubclass(model, TypedPseudoDocument))
      throw new Error(_loc("TERIOCK.FIELDS.PseudoCollectionField.notPseudoDocument"));
    const types = (options.types ||= model.TYPES);
    if (!types) throw new Error(_loc("TERIOCK.FIELDS.PseudoCollectionField.noTypes"));
    super(new PseudoTypedSchemaField(types), options, context);
    this.#documentClass = model;
    this.#collectionClass = options.collection ?? TypeCollection;
  }

  /**
   * The collection class.
   * @type {typeof TypeCollection}
   */
  #collectionClass;

  /**
   * The pseudo-document class.
   * @type {typeof TypedPseudoDocument}
   */
  #documentClass;

  /**
   * The pseudo-document class.
   * @returns {typeof TypedPseudoDocument}
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

  /** @inheritDoc */
  initialize(value, model, options = {}) {
    const obj = super.initialize(value, model, options);
    return new this.#collectionClass(Object.entries(obj).filter(([_k, inst]) => inst instanceof TypedPseudoDocument));
  }
}
