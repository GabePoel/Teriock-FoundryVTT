import { icons } from "../../../constants/display/icons.mjs";
import { EmbeddedDataModel } from "../../models/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {AccessData} parent
 * @property {ID<PseudoDocument>} _id
 */
export default class PseudoDocument extends EmbeddedDataModel {
  /**
   * Icon for this pseudo-document class.
   * @returns {string}
   */
  static get ICON() {
    return icons.ui.document;
  }

  /**
   * Label for this pseudo-document class.
   * @returns {string}
   */
  static get LABEL() {
    return "";
  }

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
   * @param {CommonSystem | HarmSystem} parent
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
      foundry.abstract.TypeDataModel,
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
   * Format an array of pseudo-documents into a collection data object.
   * @template T
   * @param {T[]} docs
   * @param {object} [options]
   * @param {boolean} [options.keepId]
   * @returns {Record<ID<T>, object>}
   */
  static toCollectionObject(docs, options = {}) {
    return Object.fromEntries(
      docs.map((d) => {
        const id = options.keepId && d._id ? d._id : foundry.utils.randomID();
        const data = d.toObject();
        data._id = id;
        return [id, data];
      }),
    );
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
   * Icon for this pseudo-document.
   * @returns {string}
   */
  get icon() {
    return this.constructor.ICON;
  }

  /**
   * The ID of this pseudo-document.
   * @returns {ID<PseudoDocument>}
   */
  get id() {
    return this._id;
  }

  /**
   * Label for this pseudo-document.
   * @returns {string}
   */
  get label() {
    return this.constructor.LABEL;
  }

  /** @inheritDoc */
  get localPath() {
    return `${this.fieldPath}.${this.id}`;
  }

  /**
   * The UUID of this pseudo-document.
   * @returns {UUID<PseudoDocument> | null}
   */
  get uuid() {
    if (!parent) return this.id ? `${this.documentName}.${this.id}` : null;
    return [this.parent?.uuid || "", this.documentName, this.id].join(".");
  }

  /**
   * Delete this pseudo-document.
   * @param {DatabaseUpdateOperation} operation
   * @returns {Promise<Document|undefined>}
   */
  async delete(operation = {}) {
    const updateData = { [`${this.fieldPath}.${this.id}`]: _del };
    return this.document.update(updateData, operation);
  }
}
