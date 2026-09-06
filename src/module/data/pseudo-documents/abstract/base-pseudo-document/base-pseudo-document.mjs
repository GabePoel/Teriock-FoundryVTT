import { mixClasses } from "../../../../helpers/construction.mjs";
import { BaseDataModel } from "../../../abstract/_module.mjs";
import { PseudoCollectionsDataMixin } from "../../../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @import { DatabaseCreateOperation, DatabaseDeleteOperation, DatabaseUpdateOperation, DatabaseWriteOperation } from "@common/abstract/_types.mjs";
 * @import { PseudoCollection } from "../../collections/_module.mjs";
 */

/**
 * @property {AccessData} parent
 */
export default class BasePseudoDocument extends mixClasses(BaseDataModel, PseudoCollectionsDataMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.PSEUDOS.Base"];

  /**
   * The document name of this Pseudo-Document.
   * @returns {string}
   */
  static get documentName() {
    return this.metadata.documentName;
  }

  /**
   * @inheritDoc.
   * @returns {Teriock.Metadata.PseudoDocumentMetadata}
   */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      documentName: "",
      icon: TERIOCK.display.icons.manifest.ui.document,
      tags: { embed: false, panel: false },
      type: "base",
      typed: false,
    });
  }

  /**
   * Localization key for this pseudo-document class' type label.
   * @returns {string}
   */
  static get typeLabel() {
    return this.metadata.typed ? `TYPES.${this.documentName}.${this.metadata.type}` : `DOCUMENT.${this.documentName}`;
  }

  /**
   * Subtypes of this pseudo-document.
   * @returns {string[]}
   */
  static get TYPES() {
    return [this.metadata.type];
  }

  /**
   * @param {object} data
   * @param {DatabaseWriteOperation} operation
   * @returns {Promise<{document: TeriockDocument, fieldPath: string, parent: TeriockDocument|BasePseudoDocument, updateData: object}>}
   * @private
   */
  static async _parseParent(data, operation) {
    const resolved = await this._resolveParent(operation);
    const updateData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [`${resolved.fieldPath}.${key}`, value]),
    );
    return { ...resolved, updateData };
  }

  /**
   * @param {DatabaseWriteOperation} operation
   * @returns {Promise<{collectionKey: string, document: TeriockDocument, fieldPath: string, parent: TeriockDocument|BasePseudoDocument}>}
   * @private
   */
  static async _resolveParent(operation) {
    let parent = operation.parent;
    if (operation.parentUuid && !parent) { parent = await fromUuid(operation.parentUuid); }
    if (!parent) { throw new Error("Pseudo-documents must have parents"); }
    parent = parent instanceof foundry.abstract.TypeDataModel ? parent.parent : parent;
    const collectionKey = parent.metadata?.pseudos?.[this.documentName];
    const fieldPath = [parent.localPath, collectionKey].filter(Boolean).join(".");
    return { collectionKey, document: parent.document, fieldPath, parent };
  }

  /**
   * Create a Pseudo-Document within some parent Document or Pseudo-Document.
   * @param {object} data
   * @param {TeriockDocument|BasePseudoDocument} parent
   * @param {DatabaseCreateOperation} operation
   * @returns {Promise<BasePseudoDocument>}
   */
  static async create(data = {}, { parent, ...operation } = {}) {
    return (await this.createDocuments([data], { parent, ...operation }))?.shift();
  }

  /**
   * Create Pseudo-Documents within some parent Document or Pseudo-Document.
   * @param {object[]} data
   * @param {Partial<DatabaseCreateOperation>} operation
   * @returns {Promise<BasePseudoDocument[]>}
   */
  static async createDocuments(data = [], operation = {}) {
    if (!this.metadata.typed) { data.forEach(d => d.type = this.metadata.type); }
    const parsed = await this._parseParent(this.toCollectionObject(data, operation), operation);
    await parsed.document.update(parsed.updateData);
    const parent = await fromUuid(parsed.parent.uuid);
    return data.map(d => parent.getEmbeddedDocument(this.documentName, d?._id));
  }

  /** @inheritDoc */
  static defineSchema() {
    return {
      _id: new fields.DocumentIdField({ initial: () => foundry.utils.randomID() }),
      type: new fields.StringField({ blank: false, initial: this.metadata.type, nullable: false, required: true }),
    };
  }

  /**
   * Delete Pseudo-Documents from some parent Document or Pseudo-Document.
   * @param {ID<BasePseudoDocument>[]} ids
   * @param {Partial<DatabaseDeleteOperation>} operation
   * @returns {Promise<BasePseudoDocument[]>}
   */
  static async deleteDocuments(ids = [], operation = {}) {
    const resolved = await this._resolveParent(operation);
    const out = ids.map(id => resolved.parent.getEmbeddedDocument(this.documentName, id));
    // Workaround for issue where _del isn't deleting Pseudo-Documents embedded within Pseudo-Documents.
    if (resolved.parent instanceof BasePseudoDocument) {
      const parentData = resolved.parent.toObject();
      const collection = foundry.utils.getProperty(parentData, resolved.collectionKey) ?? {};
      for (const id of ids) { delete collection[id]; }
      await resolved.document.update({ [resolved.parent.localPath]: _replace(parentData) });
    } else {
      const updateData = Object.fromEntries(ids.map(id => [`${resolved.fieldPath}.${id}`, _del]));
      await resolved.document.update(updateData);
    }
    return out;
  }

  /**
   * Helper function to obtain the relevant pseudo-document from drop data.
   * @param {Teriock.Application.DropData<BasePseudoDocument>} data
   * @returns {Promise<BasePseudoDocument>}
   */
  static async fromDropData(data) {
    const pseudo = await fromUuid(data.uuid);
    if (!pseudo) { throw new Error("Failed to resolve PseudoDocument."); }
    if (pseudo.documentName !== this.metadata.documentName) { throw new Error("Invalid type provided.", pseudo); }
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
    return Object.fromEntries(docs.map(d => {
      const id = options.keepId && d._id ? d._id : foundry.utils.randomID();
      const data = Object.assign(foundry.utils.isPlainObject(d) ? d : d.toObject(options.source ?? true), { _id: id });
      return [id, data];
    }));
  }

  /**
   * Update Pseudo-Documents within some parent Document or Pseudo-Document.
   * @param {object[]} updates
   * @param {Partial<DatabaseCreateOperation>} operation
   * @returns {Promise<BasePseudoDocument[]>}
   */
  static async updateDocuments(updates = [], operation = {}) {
    const parsed = await this._parseParent(this.toCollectionObject(updates, { keepId: true }), operation);
    await parsed.document.update(parsed.updateData);
    const parent = await fromUuid(parsed.parent.uuid);
    return updates.map(d => parent.getEmbeddedDocument(this.documentName, d?._id));
  }

  /**
   * The collection this belongs to.
   * @returns {PseudoCollection|null}
   */
  get collection() {
    return this.controller?.getEmbeddedCollection(this.documentName) ?? null;
  }

  /**
   * The Document or Pseudo-Document that controls this.
   * @returns {TeriockDocument|BasePseudoDocument}
   */
  get controller() {
    return this.parent instanceof BasePseudoDocument ? this.parent : this.document;
  }

  /**
   * The document name of this Pseudo-Document.
   * @returns {string}
   */
  get documentName() {
    return this.constructor.documentName;
  }

  /**
   * Path to this pseudo-document in its parent document.
   * @returns {string}
   */
  get fieldPath() {
    let path = this.controller.metadata.pseudos[this.documentName];
    if (this.parent instanceof BasePseudoDocument) { path = [this.parent.fieldPath, this.parent.id, path].join("."); }
    return path;
  }

  /**
   * The ID of this pseudo-document.
   * @returns {ID<BasePseudoDocument>}
   */
  get id() {
    return this._id;
  }

  /**
   * If this is visible.
   * @returns {boolean}
   */
  get isViewer() {
    return this.document.isViewer;
  }

  /**
   * Label for this pseudo-document.
   * @returns {string}
   */
  get label() {
    return _loc(this.constructor.typeLabel);
  }

  /** @inheritDoc */
  get localPath() {
    return `${this.fieldPath}.${this.id}`;
  }

  /**
   * Metadata.
   * @returns {{documentName: string, icon: string, label: string, sheetClass: null}}
   */
  get metadata() {
    return this.constructor.metadata;
  }

  /**
   * Icon for this pseudo-document.
   * @returns {string}
   */
  get typeIcon() {
    return this.metadata.icon;
  }

  /**
   * The UUID of this pseudo-document.
   * @returns {UUID<BasePseudoDocument> | null}
   */
  get uuid() {
    return this.controller?.uuid ? [this.controller.uuid, this.documentName, this.id].join(".") : null;
  }

  /**
   * Delete this Pseudo-Document, removing it from the database.
   * @param {Partial<DatabaseDeleteOperation>} operation - Parameters of the deletion operation
   * @returns {Promise<BasePseudoDocument|undefined>} The deleted Pseudo-Document instance, or undefined if not deleted
   */
  async delete(operation = {}) {
    return (await this.constructor.deleteDocuments([this.id], { ...operation, parent: this.controller }))?.shift();
  }

  /**
   * Delete this pseudo-document with a dialog.
   * @param {object} [options]
   * @param {DatabaseDeleteOperation} [operation]
   * @returns {Promise<*>}
   */
  async deleteDialog(options = {}, operation = {}) {
    let content = options.content;
    const type = _loc(`DOCUMENT.${this.documentName}`);
    if (!content) {
      const question = _loc("COMMON.AreYouSure");
      const warning = _loc("SIDEBAR.DeleteWarning", { type });
      content = `<p><strong>${question}</strong> ${warning}</p>`;
    }
    return foundry.applications.api.DialogV2.confirm(
      foundry.utils.mergeObject({
        content,
        window: {
          icon: "fa-solid fa-trash",
          title: `${_loc("DOCUMENT.Delete", { type })}: ${this.name ?? this.label}`,
        },
        yes: { callback: () => this.delete(operation) },
      }, options),
    );
  }

  /**
   * Duplicate this pseudo-document.
   * @returns {Promise<BasePseudoDocument>}
   */
  async duplicate() {
    return this.constructor.create(this.toObject(), { parent: this.controller });
  }

  /**
   * Get an embedded Pseudo-Document by its id from a named collection in the parent Pseudo-Document.
   * @param {string} embeddedName
   * @param {ID<BasePseudoDocument>} id
   * @returns {BasePseudoDocument}
   */
  getEmbeddedDocument(embeddedName, id) {
    return this.getEmbeddedCollection(embeddedName)?.get(id);
  }

  /**
   * Drag data for storing on initiated drag events.
   * @returns {Teriock.Application.DropData<BasePseudoDocument>}
   */
  toDragData() {
    return { type: this.documentName, uuid: this.uuid };
  }

  /**
   * Update this PseudoDocument using incremental data, saving it to the database.
   * @param {object} [data={}] - Differential update data which modifies the existing values of this pseudo-document
   * @param {Partial<Omit<DatabaseUpdateOperation, "updates">>} operation - Parameters of the update operation
   * @returns {Promise<BasePseudoDocument|undefined>} The updated PseudoDocument instance, or undefined not updated
   */
  async update(data = {}, operation = {}) {
    const out = await this.constructor.updateDocuments([{ ...data, _id: this.id }], {
      ...operation,
      parent: this.controller,
    });
    return out.shift();
  }
}
