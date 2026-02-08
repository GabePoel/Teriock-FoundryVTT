import { EmbeddedDataModel } from "../../models/_module.mjs";

const { fields } = foundry.data;

export default class PseudoDocument extends EmbeddedDataModel {
  static get metadata() {
    return {
      documentName: "",
      icon: "",
      sheetClass: null,
    };
  }

  /**
   * Create a pseudo-document within some parent document.
   * @param {object} data
   * @param {GenericCommon | CommonSystem} parent
   * @param {DatabaseCreateOperation} operation
   * @returns {Promise<PseudoDocument>}
   */
  static async create(data = {}, { parent, ...operation } = {}) {
    if (!parent) throw new Error("Pseudo-documents must have parents");
    const id =
      operation.keepId && foundry.data.validators.isValidId(data._id)
        ? data._id
        : foundry.utils.randomID();
    /** @type {CommonSystem} */
    const directParent = foundry.utils.isSubclass(
      parent,
      teriock.data.systems.abstract.CommonSystem,
    )
      ? parent
      : parent.system;
    const fieldPath =
      directParent.metadata?.pseudos?.[this.metadata.documentName];
    if (!fieldPath) throw new Error("Invalid pseudo-document parent");
    const updateData = { [`${fieldPath}.${id}`]: { ...data, _id: id } };
    await directParent.document.update(updateData, operation);
    return foundry.utils.getProperty(directParent.parent, fieldPath).get(id);
  }

  /** @inheritDoc */
  static defineSchema() {
    return {
      _id: new fields.DocumentIdField({
        initial: () => foundry.utils.randomID(),
      }),
    };
  }

  /**
   * The document name of this pseudo-document.
   * @returns {null}
   */
  get documentName() {
    return this.constructor.metadata.documentName;
  }

  /**
   * Path to this pseudo-document in its parent document.
   * @returns {string}
   */
  get fieldPath() {
    let path = this.parent.constructor.metadata.pseudos[this.documentName];
    if (this.parent instanceof PseudoDocument)
      path = [this.parent.fieldPath, this.parent.id, path].join(".");
    return path;
  }

  /**
   * The ID of this pseudo-document.
   * @returns {string}
   */
  get id() {
    return this._id;
  }

  /**
   * The UUID of this pseudo-document.
   * @returns {string}
   */
  get uuid() {
    return [this.parent.uuid, this.documentName, this.id].join(".");
  }

  /**
   * Delete this pseudo-document.
   * @param {DatabaseUpdateOperation} operation
   * @returns {Promise<Document|undefined>}
   */
  async delete(operation = {}) {
    const updateData = { [`${this.fieldPath}.-=${this.id}`]: null };
    return this.document.update(updateData, operation);
  }
}
