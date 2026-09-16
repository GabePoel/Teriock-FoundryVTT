import { icons } from "../../../../constants/display/_module.mjs";
import { mergeMetadata, mixClasses } from "../../../../helpers/construction.mjs";
import { BaseDataModel } from "../../../abstract/_module.mjs";
import { PseudoControllerDataMixin } from "../../../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @import { DatabaseCreateOperation, DatabaseDeleteOperation, DatabaseUpdateOperation, DatabaseWriteOperation } from "@common/abstract/_types.mjs";
 * @import { PseudoCollection } from "../../collections/_module.mjs";
 */

/**
 * @property {AccessData} parent
 */
export default class BasePseudoDocument extends mixClasses(BaseDataModel, PseudoControllerDataMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.PSEUDOS.Base"];

  /**
   * @inheritDoc.
   * @type {Teriock.Metadata.PseudoDocumentMetadata}
   */
  static metadata = mergeMetadata(super.metadata, {
    documentName: "",
    icon: icons.manifest.ui.document,
    tags: { embed: false, mechanic: false, panel: false, triggered: false },
    type: "base",
    typed: false,
  });

  /**
   * The document name of this Pseudo-Document.
   * @returns {string}
   */
  static get documentName() {
    return this.metadata.documentName;
  }

  /**
   * The models that are subtypes of this.
   * @returns {Record<string, BasePseudoDocument>}
   */
  static get TYPE_MODELS() {
    return { [this.metadata.type]: this };
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
    const resolved = await this._resolveParent(operation);
    const entries = data.map(d => {
      const entry = foundry.utils.isPlainObject(d) ? d : d.toObject();
      if (!this.metadata.typed) { entry.type = this.metadata.type; }
      entry._id = operation.keepId && entry._id ? entry._id : foundry.utils.randomID();
      return entry;
    });
    await resolved.document.update({ [resolved.fieldPath]: entries });
    const parent = await fromUuid(resolved.parent.uuid);
    return entries.map(e => parent.getEmbeddedDocument(this.documentName, e._id));
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
   * The parts of a module that are subtypes of this.
   * @param {object} module
   * @returns {Record<string, typeof BasePseudoDocument>}
   */
  static getTypeModels(module) {
    return Object.fromEntries(
      Object.values(module).filter(v => foundry.utils.isSubclass(v, BasePseudoDocument)).map(v => [v.metadata.type, v]),
    );
  }

  /**
   * Update Pseudo-Documents within some parent Document or Pseudo-Document.
   * @param {object[]} updates
   * @param {Partial<DatabaseUpdateOperation>} operation
   * @returns {Promise<BasePseudoDocument[]>}
   */
  static async updateDocuments(updates = [], operation = {}) {
    const resolved = await this._resolveParent(operation);
    const entries = updates.map(u => foundry.utils.isPlainObject(u) ? u : u.toObject());
    if (entries.some(e => !e._id)) {
      throw new Error("You must provide an _id for every object in the update data Array.");
    }
    await resolved.document.update({ [resolved.fieldPath]: entries });
    const parent = await fromUuid(resolved.parent.uuid);
    return entries.map(e => parent.getEmbeddedDocument(this.documentName, e._id));
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
   * @returns {Teriock.Metadata.PseudoDocumentMetadata}
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
