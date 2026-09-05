import { BasePseudoDocument } from "../pseudo-documents/abstract/_module.mjs";
import { PseudoCollection } from "../pseudo-documents/collections/_module.mjs";

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
    const types = options.types ?? { [model.metadata.type]: model };
    super(new PseudoTypedSchemaField(types), options, context);
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

  /** @inheritDoc */
  initialize(value, model, options = {}) {
    const obj = super.initialize(value, model, options);
    return new PseudoCollection(
      this.name,
      model,
      Object.values(obj).filter(inst => inst instanceof BasePseudoDocument),
      { documentClass: this.documentClass, types: this.options.types ? Object.keys(this.options?.types) : ["base"] },
    );
  }

  /** @inheritDoc */
  toObject(value) {
    return super.toObject(Object.fromEntries(value.entries()));
  }
}
