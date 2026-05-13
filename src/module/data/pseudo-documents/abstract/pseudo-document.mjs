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
      label: "",
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
   * Helper function to obtain the relevant pseudo-document from drop data.
   * @param {Teriock.Sheet.DropData<PseudoDocument>} data
   * @returns {Promise<PseudoDocument>}
   */
  static async fromDropData(data) {
    const pseudo = await fromUuid(data.uuid);
    if (!pseudo) throw new Error("Failed to resolve PseudoDocument.");
    if (pseudo.documentName !== this.metadata.documentName) {
      throw new Error(`Invalid type provided.`, pseudo);
    }
    return pseudo;
  }

  /**
   * Format an array of pseudo-documents into a collection data object.
   * @template T
   * @param {T[]} docs
   * @param {object} [options]
   * @param {boolean} [options.keepId]
   * @param {boolean} [options.source=true]
   * @returns {Record<ID<T>, object>}
   */
  static toCollectionObject(docs, options = {}) {
    return Object.fromEntries(
      docs.map((d) => {
        const id = options.keepId && d._id ? d._id : foundry.utils.randomID();
        const data = foundry.utils.isPlainObject(d)
          ? d
          : d.toObject(options.source ?? true);
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
    return _loc(this.constructor.LABEL);
  }

  /** @inheritDoc */
  get localPath() {
    return `${this.fieldPath}.${this.id}`;
  }

  get metadata() {
    return this.constructor.metadata;
  }

  /**
   * The UUID of this pseudo-document.
   * @returns {UUID<PseudoDocument> | null}
   */
  get puuid() {
    return [this.document?.uuid || "", this.documentName, this.id].join(".");
  }

  /**
   * Delete this pseudo-document.
   * @param {DatabaseUpdateOperation} operation
   * @returns {Promise<Document|undefined>}
   */
  async delete(operation = {}) {
    const updateData = { [this.localPath]: _del };
    return this.document.update(updateData, operation);
  }

  /**
   * Delete this pseudo-document with a dialog.
   * @param {object} [options]
   * @param {DatabaseDeleteOperation} [operation]
   * @returns {Promise<*>}
   */
  async deleteDialog(options = {}, operation = {}) {
    let content = options.content;
    const type = _loc(this.constructor.metadata.label);
    if (!content) {
      const question = _loc("COMMON.AreYouSure");
      const warning = _loc("SIDEBAR.DeleteWarning", {
        type: type.toLowerCase(),
      });
      content = `<p><strong>${question}</strong> ${warning}</p>`;
    }
    return foundry.applications.api.DialogV2.confirm(
      foundry.utils.mergeObject(
        {
          content,
          yes: { callback: () => this.delete(operation) },
          window: {
            icon: "fa-solid fa-trash",
            title: `${_loc("DOCUMENT.Delete", { type })}: ${this.name ?? this.label}`,
          },
        },
        options,
      ),
    );
  }

  /**
   * Duplicate this pseudo-document.
   * @returns {Promise<void>}
   */
  async duplicate() {
    await this.constructor.create(this.toObject(), { parent: this.document });
  }

  /**
   * Drag data for storing on initiated drag events.
   * @returns {Teriock.Sheet.DropData<PseudoDocument>}
   */
  toDragData() {
    return { type: this.documentName, uuid: this.puuid };
  }
}
