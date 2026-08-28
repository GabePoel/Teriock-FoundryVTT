import { BasePseudoDocument, TypedPseudoDocument } from "../pseudo-documents/abstract/_module.mjs";
import { PseudoCollection } from "../pseudo-documents/collections/_module.mjs";

const { EmbeddedDataField, TypedObjectField, TypedSchemaField } = foundry.data.fields;

/**
 * @import { DataFieldContext, DataFieldOptions } from "@common/data/_types.mjs";
 */

class PseudoTypedSchemaField extends TypedSchemaField {
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
   * @param {typeof TypedPseudoDocument} model
   * @param {DataFieldOptions} [options]
   * @param {Record<string, typeof TypedPseudoDocument>} [options.types]
   * @param {DataFieldContext} [context]
   */
  constructor(model, options = {}, context = {}) {
    if (!foundry.utils.isSubclass(model, BasePseudoDocument)) {
      throw new Error(_loc("TERIOCK.FIELDS.PseudoCollectionField.notPseudoDocument"));
    }
    if (foundry.utils.isSubclass(model, TypedPseudoDocument)) {
      const types = options.types;
      if (!types) { throw new Error(_loc("TERIOCK.FIELDS.PseudoCollectionField.noTypes")); }
      super(new PseudoTypedSchemaField(types), options, context);
    } else {
      super(new EmbeddedDataField(model), options, context);
    }
    this.#documentClass = model;
  }

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
    return new PseudoCollection(
      this.name,
      model,
      Object.values(obj).filter(inst => inst instanceof BasePseudoDocument),
      { documentClass: this.documentClass, types: Object.keys(this.options?.types ?? {}) },
    );
  }

  /** @inheritDoc */
  toObject(value) {
    return super.toObject(Object.fromEntries(value.entries()));
  }
}
