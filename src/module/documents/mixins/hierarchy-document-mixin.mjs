import { resolveCollection, resolveDocument } from "../../helpers/resolve.mjs";
import { SubCollection, TypeCollection } from "../collections/_module.mjs";

const { Collection, deepClone, deleteProperty, getProperty, hasProperty, randomID, setProperty } = foundry.utils;

/**
 * @import { DatabaseCreateOperation, DatabaseDeleteOperation, DatabaseUpdateOperation, DatabaseWriteOperation } from "@common/abstract/_types.mjs";
 * @import { TeriockActiveEffect, TeriockActor, TeriockItem } from "../_module.mjs";
 */

/**
 * Document mixin to support hierarchies of the same document type. This requires infrastructure in lots of other parts
 * of the codebase.
 *
 * Hierarchies of documents of the same type are for cases like "items in items" or "active effects in active effects".
 * They take the form of documents that share the same collection (and, where possible, the same folder) and have some
 * magic controlling when they are/aren't visible. This is integrated with {@link HierarchySystemMixin} and requires
 * both {@link TeriockCompendiumDirectory} and {@link TeriockCompendium} in order to have compendium information
 * displayed properly.
 *
 * This mixin is not related to pseudo-documents in any way.
 *
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, HierarchyDocument>}
 * @see {HierarchySystemMixin}
 * @see {SubCollection}
 * @see {TeriockCompendiumDirectory}
 * @see {TeriockCompendium}
 */
export default function HierarchyDocumentMixin(Base) {
  /**
   * @mixin
   * @property {HierarchySystem} system
   */
  class HierarchyDocument extends Base {
    /** @inheritDoc */
    static get documentMetadata() {
      return Object.assign(super.documentMetadata, { hierarchy: true });
    }

    /**
     * Ensure all compendiums that document references are in are properly cached during {@link _preCreateOperation}.
     * @param {HierarchyDocument[]} documents
     * @returns {Promise<void>}
     */
    static async _cacheDocumentReferenceCompendiums(documents) {
      const docsWithRefs = documents.filter(d => d.system?._ref);
      const cachedDocs = /** @type {TeriockDocument[]} */ await Promise.all(
        docsWithRefs.map(d => fromUuid(d.system._ref)),
      );
      const compendiums = new Set(cachedDocs.filter(d => d?.inCompendium).map(d => d.compendium));
      await Promise.all(Array.from(compendiums).map(c => c.getIndex()));
    }

    /** @inheritDoc */
    static async _onCreateOperation(documents, operation, user) {
      // Override normal client document sheet rendering behavior so subs don't have their sheets rendered.
      const cachedRenderSheet = operation.renderSheet;
      if (operation.renderSheet && operation.dontRenderSheets && user.id === game.user.id) {
        operation.renderSheet = false;
        for (const [i, document] of documents.entries()) {
          if (operation.dontRenderSheets.includes(document.id)) { continue; }
          document.sheet?.render(true, { renderContext: `create${this.documentName}`, renderData: operation.data[i] });
        }
      }
      await super._onCreateOperation(documents, operation, user);
      operation.renderSheet = cachedRenderSheet;
    }

    /**
     * @inheritDoc
     * @param {(TeriockActiveEffect|TeriockActor|TeriockItem)[]} documents
     * @param {DatabaseCreateOperation & Teriock.System._CreateOperation} operation
     * @param {TeriockUser} user
     * @returns {Promise<boolean|void>}
     */
    static async _preCreateOperation(documents, operation, user) {
      const yes = await super._preCreateOperation(documents, operation, user);
      if (yes === false) { return false; }

      operation.cachedKeepId = operation.keepId;
      operation.keepId = true;
      operation.dontRenderSheets ??= [];
      for (const d of documents) { if (!d._id) { d.updateSource({ _id: randomID() }); } }
      const supDocs = documents.filter(d => hasProperty(d, "flags._teriock.id"));
      const idMap = new Map(supDocs.map(d => [getProperty(d, "flags._teriock.id"), d]));
      for (const d of documents) {
        if (hasProperty(d, "flags._teriock.sup")) {
          const sup = idMap.get(getProperty(d, "flags._teriock.sup"));
          d.updateSource({ folder: sup?.folder, "system._sup": sup?.id });
          if (d._id) { operation.dontRenderSheets.push(d._id); }
        }
        d.updateSource({ "flags._teriock": _del });
      }
    }

    /**
     * @inheritDoc
     * @param {(TeriockActiveEffect|TeriockActor|TeriockItem)[]} documents
     * @param {DatabaseDeleteOperation & Teriock.System._Operation} operation
     * @param {TeriockUser} user
     * @returns {Promise<boolean|void>}
     */
    static async _preDeleteOperation(documents, operation, user) {
      const yes = await super._preDeleteOperation(documents, operation, user);
      if (yes === false) { return false; }

      for (const doc of documents) { operation.ids.push(...doc.allSubs.contents.map(s => s._id)); }
      // Deleting a sup alongside one of its subs would push that sub's id a second time.
      operation.ids = Array.from(new Set(operation.ids));
    }

    /**
     * @inheritDoc
     * @param {(TeriockActiveEffect|TeriockActor|TeriockItem)[]} documents
     * @param {DatabaseUpdateOperation & Teriock.System._Operation} operation
     * @param {TeriockUser} user
     * @returns {Promise<boolean|void>}
     */
    static async _preUpdateOperation(documents, operation, user) {
      const yes = await super._preUpdateOperation(documents, operation, user);
      if (yes === false) { return false; }

      for (const doc of documents) {
        const folderUpdate = operation.updates.find(update => update._id === doc._id && hasProperty(update, "folder"));
        if (folderUpdate) {
          const subIds = doc.allSubs.contents.map(s => s._id);
          for (const subId of subIds) {
            const subUpdate = operation.updates.find(update => update._id === subId);
            if (!subUpdate) { operation.updates.push({ _id: subId, folder: folderUpdate.folder }); }
            else { subUpdate.folder = folderUpdate.folder; }
          }
        }
      }
    }

    /**
     * Check if there is a circular dependencies between a sup and sub.
     * @param {TeriockDocument} sup
     * @param {TeriockDocument} sub
     * @todo Make a synchronous version of this so it can run during drag and drop.
     */
    static async checkIfCyclic(sup, sub) {
      if (sup?.documentName !== sub?.documentName) { return false; }
      if (sup?.id === sub?.id) { return true; }
      if (typeof sup.getAllSups === "function") { return (await sup.getAllSups()).has(sub.id); }
      return false;
    }

    /**
     * @inheritDoc
     * @param {object|HierarchyDocument[]} data
     * @param {Partial<Omit<DatabaseCreateOperation, "data"> & Teriock.System._CreateOperation>} operation
     * @returns {Promise<(TeriockActiveEffect|TeriockActor|TeriockItem)[]>}
     */
    static async createDocuments(data = [], operation = {}) {
      if (typeof operation.cachedKeepId === "boolean") {
        operation.keepId = operation.cachedKeepId;
        delete operation.cachedKeepId;
      }
      const cleanedData = data.map(doc => doc instanceof foundry.abstract.Document ? doc.toObject(true) : doc);
      const resolvedData = await Promise.all(cleanedData.map(doc => this.resolveObject(doc)));
      const expandedData = this.expandDocumentDataArray(resolvedData, null, operation);
      const hasNonSub = expandedData.some(d => !getProperty(d, "system._sup"));
      const filteredData = expandedData.filter(d => {
        const knownSubs = operation.knownSubs ?? new Set();
        if (hasNonSub && getProperty(d, "system._sup") && !getProperty(d, "flags._teriock.keep")) { return false; }
        return !(knownSubs.has(getProperty(d, "flags._teriock.ref")) && !getProperty(d, "flags._teriock.keep"));
      });
      return super.createDocuments(filteredData, operation);
    }

    /**
     * Expand data arrays.
     * @param {object[]} data
     * @param {string|null} sup
     * @param {object} operation
     * @returns {object[]}
     */
    static expandDocumentDataArray(data, sup = null, operation = {}) {
      operation.knownSubs ??= new Set();
      const result = [];
      for (const d of data) {
        if (sup && !(operation?.keepSubIds === false)) { setProperty(d, "_id", randomID()); }
        if (!sup && !(operation?.keepId === false)) { setProperty(d, "_id", randomID()); }
        if (sup) {
          setProperty(d, "flags._teriock.sup", sup);
          setProperty(d, "flags._teriock.keep", true);
          deleteProperty(d, "system._sup");
          if (!operation?.allowDuplicateSubs && getProperty(d, "flags._teriock.ref")) {
            operation.knownSubs.add(getProperty(d, "flags._teriock.ref"));
          }
        }
        const id = randomID();
        setProperty(d, "flags._teriock.id", id);
        const subs = d.subs ?? [];
        delete d.subs;
        result.push(d);
        result.push(...this.expandDocumentDataArray(subs, id, operation));
      }
      return result;
    }

    /**
     * Resolve a `toObject` call.
     * @param {UUID|object} obj
     * @returns {Promise<object>}
     */
    static async resolveObject(obj) {
      if (typeof obj === "string") {
        const doc = await fromUuid(obj);
        return this.resolveObject(doc?.toObject() ?? {});
      }
      if (Array.isArray(obj?.subs) && obj.subs.length) {
        obj.subs = await Promise.all(obj.subs.map(s => this.resolveObject(s)));
      }
      return obj;
    }

    /**
     * Validate if a relationship between a sup and sub is allowed.
     * @param {HierarchyDocument} sup
     * @param {HierarchyDocument} sub
     * @param {DatabaseWriteOperation & Teriock.System._Operation} operation
     * @returns {Promise<boolean>}
     */
    static async validateRelationship(sup, sub, operation) {
      const out = !(await this.checkIfCyclic(sup, sub));
      if (out === false && operation.notifyOnFailure) {
        ui.notifications.error("TERIOCK.OPERATIONS.cyclic", {
          format: { sub: sub.name, sup: sup.name },
          localize: true,
        });
      }
      return out;
    }

    /**
     * Render the sheets of all the sups.
     */
    #reloadSups() {
      this.getAllSups().then(result => {
        result.forEach(doc => {
          if (typeof doc.resetChildMaps === "function") { doc.resetChildMaps(); }
          if (doc.isViewer) { doc.render(); }
        });
      });
      if (this.collection.name === "CompendiumCollection") {
        this.collection.apps.forEach(app => {
          if (app.rendered) { app.render(); }
        });
      }
    }

    /**
     * All the subs descendant of this document or their indexes.
     * @returns {TypeCollection}
     */
    get allSubs() {
      const found = new Map();
      let toSearchFor = new Set([this.id]);
      while (toSearchFor.size) {
        const nextSearch = new Set();
        for (const entry of this.siblingCollection ?? []) {
          if (toSearchFor.has(getProperty(entry, "system._sup")) && !found.has(entry._id)) {
            found.set(entry._id, entry);
            nextSearch.add(entry._id);
          }
        }
        toSearchFor = nextSearch;
      }
      return new TypeCollection(found);
    }

    /**
     * Lazily recomputed collection of all the sups ancestral to this document or their indexes.
     * @returns {TypeCollection}
     */
    get allSups() {
      if (!this._cache.allSups) {
        const sups = new Map();
        let supId = this.system?._sup;
        while (supId && !sups.has(supId)) {
          const sup = this.siblingCollection?.get(supId);
          if (!sup) { break; }
          sups.set(supId, sup);
          supId = getProperty(sup, "system._sup");
        }
        this._cache.allSups = new TypeCollection(sups);
      }
      return this._cache.allSups;
    }

    /**
     * The document that most directly provides this one.
     * @returns {Teriock.Hierarchy.SyncDoc<TeriockActiveEffect|TeriockActor|TeriockItem>}
     */
    get elder() {
      return this.sup || this.parent;
    }

    /** @inheritDoc */
    get master() {
      return this.sup || super.master;
    }

    /**
     * The collection that contains this and its siblings or their indexes.
     * @returns {TypeCollection<HierarchyDocument, HierarchyDocument>}
     */
    get siblingCollection() {
      let collection = this.collection;
      if (collection?.index instanceof Collection) { collection = collection.index; }
      return collection;
    }

    /**
     * Lazily recomputed collection of the subs of this document or their indexes.
     * @returns {SubCollection}
     */
    get subs() {
      if (!this._cache.subs) {
        const subArray = this.siblingCollection?.filter(d => getProperty(d, "system._sup") === this.id) ?? [];
        this._cache.subs = new SubCollection(subArray.map(d => [d._id, d]), this.id);
      }
      return this._cache.subs;
    }

    /**
     * The sup of this document or its index.
     * @returns {Teriock.Hierarchy.SyncDoc<TeriockActiveEffect|TeriockActor|TeriockItem>|undefined}
     */
    get sup() {
      if (this.system?._sup) { return this.siblingCollection?.get(this.system._sup); }
    }

    /** @inheritDoc */
    get visible() {
      return super.visible && !this.sup;
    }

    /** @inheritDoc */
    get visibleChildren() {
      return super.visibleChildren.filter(c =>
        c?.parent === this || getProperty(c, "system._sup") === this.id || c?.master === this
      );
    }

    /** @inheritDoc */
    _makeChildArray() {
      return [...super._makeChildArray(), ...(this.subs.contents || [])];
    }

    /** @inheritDoc */
    _onCreate(data, options, userId) {
      super._onCreate(data, options, userId);
      if (options.render !== false) { this.renderRelativeSheets(); }
    }

    /** @inheritDoc */
    _onDelete(options, userId) {
      super._onDelete(options, userId);
      // If this is deleted as part of a folder it might not call the appropriate operation and descendents need to be
      // deleted separately. Only remaining documents get deleted. This sucks but IDK a better solution.
      if (this.checkEditor(userId)) {
        this.getAllSubs().then((subs) =>
          this.constructor.deleteDocuments(subs.contents.filter((s) => s?.persisted).map((s) => s._id), {
            pack: this.compendium?.collection,
            parent: this.parent,
          })
        ).catch(err => console.warn(`Failed to delete subs of ${this.uuid}.`, err));
      }
      if (options.render !== false) { this.renderRelativeSheets(); }
    }

    /** @inheritDoc */
    _onUpdate(data, options, userId) {
      super._onUpdate(data, options, userId);
      if (options.render !== false) { this.renderRelativeSheets(); }
    }

    /** @inheritDoc */
    async _preCreate(data, options, user) {
      const yes = await super._preCreate(data, options, user);
      if (yes === false) { return false; }

      const elder = await this.getElder();
      const valid = await this.constructor.validateRelationship(elder, this, options);
      if (!valid) { return false; }
    }

    /** @inheritDoc */
    async _preUpdate(changes, options, user) {
      const yes = await super._preUpdate(changes, options, user);
      if (yes === false) { return false; }

      const _sup = getProperty(changes, "system._sup");
      if (_sup) {
        const collection = this.siblingCollection;
        const sup = await resolveDocument(collection?.get(_sup));
        const valid = await this.constructor.validateRelationship(sup, this, options);
        if (!valid) { return false; }
      }
    }

    /** @inheritDoc */
    checkAncestor(doc) {
      if (doc?.uuid === this.uuid) { return true; }
      return this.elder?.checkAncestor ? this.elder?.checkAncestor(doc) || false : false;
    }

    /**
     * Create multiple sub Document instances in a sup Document's collection using provided input data.
     * @param {object[]} [data]
     * @param {Partial<DatabaseCreateOperation & Teriock.System._CreateOperation>} [operation]
     * @returns {Promise<(TeriockActiveEffect|TeriockItem)[]>}
     */
    async createSubDocuments(data = [], operation = {}) {
      const out = await foundry.documents.modifyBatch([this.getCreateSubDocumentsOperation(data, operation)]);
      return out[0];
    }

    /**
     * Delete multiple sub Document instances in a sup Document's collection using provided string ids.
     * @param {ID<TeriockActiveEffect|TeriockActor|TeriockItem>[]} [ids]
     * @param {DatabaseDeleteOperation} [operation]
     * @returns {Promise<(TeriockActiveEffect|TeriockActor|TeriockItem)[]>}
     */
    async deleteSubDocuments(ids = [], operation = {}) {
      const out = await foundry.documents.modifyBatch([this.getDeleteSubDocumentsOperation(ids, operation)]);
      return out[0];
    }

    /**
     * All the subs descendant of this document.
     * @returns {Promise<TypeCollection>}
     */
    async getAllSubs() {
      return resolveCollection(this.allSubs);
    }

    /**
     * All the sups ancestral to this document.
     * @returns {Promise<TypeCollection>}
     */
    async getAllSups() {
      return resolveCollection(this.allSups);
    }

    /** @inheritDoc */
    getCreateChildDocumentsOperation(embeddedName, data = [], operation = {}) {
      if (embeddedName === this.documentName) { return this.getCreateSubDocumentsOperation(data, operation); }
      return super.getCreateChildDocumentsOperation(embeddedName, data, operation);
    }

    /**
     * Get the operation to create sub Documents.
     * @param {object[]} [data]
     * @param {Partial<DatabaseCreateOperation & Teriock.System._CreateOperation>} [operation]
     * @returns {Partial<DatabaseCreateOperation & Teriock.System._CreateOperation>}
     */
    getCreateSubDocumentsOperation(data = [], operation = {}) {
      data = deepClone(data);
      for (const d of data) {
        setProperty(d, "system._sup", this.id);
        setProperty(d, "folder", this.folder?.id || null);
      }
      return {
        ...operation,
        action: "create",
        data,
        documentName: this.documentName,
        pack: this.pack,
        parent: this.parent,
      };
    }

    /** @inheritDoc */
    getDeleteChildDocumentsOperation(embeddedName, ids = [], operation = {}) {
      if (embeddedName === this.documentName) { return this.getDeleteSubDocumentsOperation(ids, operation); }
      return super.getDeleteChildDocumentsOperation(embeddedName, ids, operation);
    }

    /**
     * Get the operation to delete sub Documents.
     * @param {ID<TeriockActiveEffect|TeriockActor|TeriockItem>[]} ids
     * @param {Partial<DatabaseDeleteOperation & Teriock.System._Operation>} operation
     * @returns {Partial<DatabaseDeleteOperation & Teriock.System._Operation>}
     */
    getDeleteSubDocumentsOperation(ids = [], operation = {}) {
      const subIds = new Set(this.subs.map(s => s._id));
      return {
        ...operation,
        action: "delete",
        documentName: this.documentName,
        ids: ids.filter(id => subIds.has(id)),
        pack: this.pack,
        parent: this.parent,
      };
    }

    /**
     * The document that provides this document.
     * @returns {Promise<TeriockActiveEffect|TeriockActor|TeriockItem|void>}
     */
    async getElder() {
      return resolveDocument(this.elder);
    }

    /**
     * The subs of this document.
     * @returns {Promise<TypeCollection>}
     */
    async getSubs() {
      return resolveCollection(this.subs);
    }

    /**
     * The sup of this document.
     * @returns {Promise<TeriockActiveEffect|TeriockActor|TeriockItem|void>}
     */
    async getSup() {
      return resolveDocument(this.sup);
    }

    /** @inheritDoc */
    getUpdateChildDocumentsOperation(embeddedName, updates = [], operation = {}) {
      if (embeddedName === this.documentName) { return this.getUpdateSubDocumentsOperation(updates, operation); }
      return super.getUpdateChildDocumentsOperation(embeddedName, updates, operation);
    }

    /**
     * Get the operation to update sub Documents.
     * @param {object[]} [updates]
     * @param {Partial<DatabaseUpdateOperation & Teriock.System._Operation>} [operation]
     * @returns {Partial<DatabaseUpdateOperation & Teriock.System._Operation>}
     */
    getUpdateSubDocumentsOperation(updates = [], operation = {}) {
      const subIds = new Set(this.subs.map(s => s._id));
      return {
        ...operation,
        action: "update",
        documentName: this.documentName,
        pack: this.pack,
        parent: this.parent,
        updates: updates.filter(update => subIds.has(update._id)),
      };
    }

    /** @inheritDoc */
    prepareData() {
      super.prepareData();
      // If this moved to a different sup, the old sup isn't reached by #reloadSups and must be reset directly.
      if (this._cache.supId && this._cache.supId !== this.system._sup) {
        const previousSup = this.siblingCollection?.get(this._cache.supId);
        if (typeof previousSup?.resetChildMaps === "function") {
          previousSup.resetChildMaps();
          if (previousSup.isViewer) { previousSup.render(); }
        }
      }
      this._cache.supId = this.system._sup;
    }

    /**
     * Render sheets of documents which have control over this.
     */
    renderRelativeSheets() {
      this.#reloadSups();
    }

    /** @inheritDoc */
    resetChildMaps() {
      super.resetChildMaps();
      delete this._cache.allSups;
      delete this._cache.subs;
    }

    /** @inheritDoc */
    toObject(source = true) {
      const out = super.toObject(source);
      if (this.collection) { setProperty(out, "flags._teriock.ref", this.uuid); }
      out.subs = this.subs.map(s => {
        if (typeof s.toObject === "function") { return s.toObject(source); }
        return s.uuid;
      }).filter(Boolean);
      return out;
    }

    /**
     * Copy and transform the data model of this and all its subs into an array of plain objects.
     * Refs are stripped from the array so that children aren't created multiple times.
     * @param {boolean} [source=true]
     * @returns {Promise<object[]>}
     */
    async toObjects(source = true) {
      const data = [this.toObject(source)];
      for (const s of (await this.getAllSubs()).contents) { data.push(s?.toObject(source)); }
      return data;
    }

    /**
     * Update multiple sub Document instances in a sup Document's collection using provided differential data.
     * @param {object[]} [updates]
     * @param {DatabaseUpdateOperation} [operation]
     * @returns {Promise<(TeriockActiveEffect|TeriockActor|TeriockItem)[]>}
     */
    async updateSubDocuments(updates = [], operation = {}) {
      const out = await foundry.documents.modifyBatch([this.getUpdateSubDocumentsOperation(updates, operation)]);
      return out[0];
    }
  }

  return HierarchyDocument;
}
