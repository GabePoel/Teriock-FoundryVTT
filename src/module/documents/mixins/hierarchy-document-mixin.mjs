import { resolveCollection, resolveDocument } from "../../helpers/resolve.mjs";
import { TypeCollection } from "../collections/_module.mjs";

const { Collection } = foundry.utils;

/**
 * Document mixin to support hierarchies of the same document type.
 * @param {typeof BaseDocument} Base
 */
export default function HierarchyDocumentMixin(Base) {
  return (
    /**
     * @extends AnyCommonDocument
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
            document.sheet?.render(true, {
              renderContext: `create${this.documentName}`,
              renderData: operation.data[i],
            });
          }
        }
        await super._onCreateOperation(documents, operation, user);
        operation.renderSheet = cachedRenderSheet;
      }

      /**
       * @inheritDoc
       * @param {AnyCommonDocument[]} documents
       * @param {DatabaseCreateOperation & Teriock.System._CreateOperation} operation
       * @param {TeriockUser} user
       * @returns {Promise<boolean|void>}
       */
      static async _preCreateOperation(documents, operation, user) {
        const yes = await super._preCreateOperation(documents, operation, user);
        if (yes === false) { return false; }

        operation.cachedKeepId = operation.keepId;
        operation.isKeepIdCached = true;
        operation.dontRenderSheets = [];
        documents.sort((a, b) => {
          const aSup = !!a?.system?._sup;
          const bSup = !!b?.system?._sup;
          return aSup - bSup;
        });
        const filteredDocuments = documents.filter(d => {
          const collection = d.siblingCollection;
          if (d?.system?._sup && !operation.dontFilterSubs) { return collection.has(d.system._sup); }
          return true;
        });
        if (!operation.allowDuplicateSubs) {
          documents.length = 0;
          documents.push(...filteredDocuments);
        }
        const keepId = operation.keepId;
        const toCreate = [];
        const knownRefs = [];
        await this._cacheDocumentReferenceCompendiums(documents);
        for (const doc of documents) {
          if (doc.system?._ref) {
            const ref = await fromUuid(doc.system._ref);
            let create = true;
            if (ref) {
              if (knownRefs.includes(ref.uuid) && !operation.allowDuplicateSubs) { create = false; }
              else { knownRefs.push(ref.uuid); }
            }
            if (ref && ref.subs.size && create) {
              operation.keepId = true;
              const newId = keepId ? doc._id : foundry.utils.randomID();
              const newDoc = doc.clone({ _id: newId }, { keepId: true });
              toCreate.push(newDoc);
              /** @type {Record<ID<AnyCommonDocument>, ID<AnyCommonDocument>>} */
              const idMap = { [ref.id]: newDoc._id };
              /** @type {TypeCollection<ID<HierarchyDocument>, HierarchyDocument>} */
              const allRefSubs = await ref.getAllSubs();
              const clones = [];
              for (const sub of allRefSubs.contents) {
                knownRefs.push(sub.uuid);
                const subClone = sub.clone({ folder: newDoc.folder }, { keepId });
                if (!subClone._id && !operation.keepSubIds) {
                  subClone.updateSource({ _id: foundry.utils.randomID() });
                }
                idMap[sub.id] = subClone._id;
                clones.push(subClone);
                operation.dontRenderSheets.push(subClone._id);
              }
              for (const clone of clones) { clone.updateSource({ "system._sup": idMap[clone.system._sup] }); }
              toCreate.push(...clones);
            } else if (create) {
              toCreate.push(doc);
            }
          } else {
            toCreate.push(doc);
          }
        }
        documents.length = 0;
        documents.push(...toCreate);
      }

      /**
       * @inheritDoc
       * @param {AnyCommonDocument[]} documents
       * @param {DatabaseDeleteOperation & Teriock.System._Operation} operation
       * @param {TeriockUser} user
       * @returns {Promise<boolean|void>}
       */
      static async _preDeleteOperation(documents, operation, user) {
        const yes = await super._preDeleteOperation(documents, operation, user);
        if (yes === false) { return false; }

        for (const doc of documents) { operation.ids.push(...doc.allSubs.contents.map(s => s._id)); }
      }

      /**
       * @inheritDoc
       * @param {AnyCommonDocument[]} documents
       * @param {DatabaseUpdateOperation & Teriock.System._Operation} operation
       * @param {TeriockUser} user
       * @returns {Promise<boolean|void>}
       */
      static async _preUpdateOperation(documents, operation, user) {
        const yes = await super._preUpdateOperation(documents, operation, user);
        if (yes === false) { return false; }

        for (const doc of documents) {
          const folderUpdate = operation.updates.find(update =>
            update._id === doc._id && foundry.utils.hasProperty(update, "folder")
          );
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
       * @param {HierarchyDocument} sup
       * @param {HierarchyDocument} sub
       */
      static async checkIfCyclic(sup, sub) {
        if (sup?.documentName !== sub?.documentName) { return false; }
        if (sup?.id === sub?.id) { return true; }
        if (typeof sup.getAllSups === "function") { return (await sup.getAllSups()).has(sub.id); }
        else { return false; }
      }

      /**
       * @inheritDoc
       * @param {object|HierarchyDocument[]} data
       * @param {Partial<Omit<DatabaseCreateOperation, "data"> & Teriock.System._CreateOperation>} operation
       * @returns {Promise<AnyCommonDocument[]>}
       */
      static async createDocuments(data = [], operation = {}) {
        // Pre-clean documents so they always have their `_ref` UUID available
        for (let i = 0; i < data.length; i++) {
          const doc = data[i];
          if (doc instanceof foundry.abstract.Document) { data[i] = doc.toObject(true); }
        }
        if (operation.isKeepIdCached) { operation.keepId = operation.cachedKeepId; }
        delete operation.isKeepIdCached;
        delete operation.cachedKeepId;
        return super.createDocuments(data, operation);
      }

      /**
       * Get all subs for a given document.
       * @param {AnyCommonDocument|Index<AnyCommonDocument>} document
       * @param {Collection} [collection]
       * @returns {TypeCollection}
       */
      static findAllSubs(document, collection) {
        if (this.findSubs(document, collection).size === 0) { return new TypeCollection(); }
        return new TypeCollection(
          this.findSubs(document, collection).contents.flatMap(s => [s, ...this.findAllSubs(s, collection)]).map(
            s => [s._id, s]
          ),
        );
      }

      /**
       * Get all sups for a given document.
       * @param {AnyCommonDocument|Index<AnyCommonDocument>} document
       * @param {Collection} [collection]
       * @returns {TypeCollection}
       */
      static findAllSups(document, collection) {
        if (!this.findSup(document, collection)) { return new TypeCollection(); }
        return new TypeCollection(
          [this.findSup(document, collection)].concat(
            this.findAllSups(this.findSup(document, collection))?.contents || [],
          ).map(d => [d._id, d]),
        );
      }

      /**
       * Get subs for a given document.
       * @param {AnyCommonDocument|Index<AnyCommonDocument>} document
       * @param {Collection} [collection]
       * @returns {TypeCollection}
       */
      static findSubs(document, collection) {
        if (!collection) { collection = document.siblingCollection; }
        const subArray = collection.filter(d => foundry.utils.getProperty(d, "system._sup") === document._id);
        return new TypeCollection(subArray.map(d => [d._id, d]));
      }

      /**
       * The sup for a given document.
       * @param {AnyCommonDocument|Index<AnyCommonDocument>} document
       * @param {Collection} collection
       * @returns {AnyCommonDocument|undefined}
       */
      static findSup(document, collection) {
        if (!collection) { collection = document.siblingCollection; }
        if (document.system?._sup) { return collection?.get(document.system._sup); }
      }

      /**
       * Validate if a relationship between a sup and sub is allowed.
       * @param {HierarchyDocument} sup
       * @param {HierarchyDocument} sub
       * @returns {Promise<boolean>}
       */
      static async validateRelationship(sup, sub) {
        return !(await this.checkIfCyclic(sup, sub));
      }

      /**
       * Render the sheet of the dependee.
       */
      #reloadDependee() {
        const doc = this.dependee;
        if (!doc) { return; }
        if (typeof doc.resetChildMaps === "function") { doc.resetChildMaps(); }
        if (doc.isViewer) { doc?.sheet?.render({ force: false }); }
      }

      /**
       * Render the sheets of all the sups.
       */
      #reloadSups() {
        this.getAllSups().then(result => {
          result.forEach(doc => {
            if (typeof doc.resetChildMaps === "function") { doc.resetChildMaps(); }
            if (doc.isViewer) { doc.sheet?.render({ force: false }); }
          });
        });
        if (this.collection.name === "CompendiumCollection") {
          this.collection.apps.forEach(app => {
            if (app.rendered) { app.render(); }
          });
        }
      }

      /**
       * Render sheets of documents which have control over this.
       */
      #renderSheets() {
        this.#reloadSups();
        this.#reloadDependee();
      }

      /**
       * All the sub descendant of this document or their indexes.
       * @returns {TypeCollection}
       */
      get allSubs() {
        return HierarchyDocument.findAllSubs(this, this.siblingCollection);
      }

      /**
       * All the sups ancestral to this document or their indexes.
       * @returns {TypeCollection}
       */
      get allSups() {
        return HierarchyDocument.findAllSups(this, this.siblingCollection);
      }

      /**
       * Array containing all children or their indexes.
       * @returns {AnyChildDocument[]}
       */
      get childArray() {
        return [...super.childArray, ...(this.subs.contents || []), ...this.dependents];
      }

      /**
       * A document that this depends on.
       * @return {AnyChildDocument|null}
       */
      get dependee() {
        if (this.system._dep) {
          const uuid = game.teriock?.dependents.resolveDependentID(this.system._dep, this);
          if (uuid) { return game.teriock?.dependents.fetchFromUuid(this, uuid); }
        }
        return null;
      }

      /**
       * Array of dependent documents.
       * @return {AnyChildDocument[]}
       */
      get dependents() {
        return game.teriock?.dependents.get(this);
      }

      /**
       * The document that most directly provides this one.
       * @returns {SyncDoc<AnyCommonDocument>}
       */
      get elder() {
        return this.sup || this.parent;
      }

      /** @inheritDoc */
      get master() {
        return this.sup || this.dependee || this.parent;
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
       * The subs of this document or their indexes.
       * @returns {TypeCollection}
       */
      get subs() {
        return HierarchyDocument.findSubs(this, this.siblingCollection);
      }

      /**
       * The sup of this document or its index.
       * @returns {SyncDoc<AnyCommonDocument>|undefined}
       */
      get sup() {
        return HierarchyDocument.findSup(this, this.siblingCollection);
      }

      /** @inheritDoc */
      get visible() {
        return super.visible && !this.sup;
      }

      /** @inheritDoc */
      _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        this.#renderSheets();
      }

      /** @inheritDoc */
      _onDelete(options, userId) {
        super._onDelete(options, userId);
        if (game.user.isActiveGM) { this.dependents.forEach(d => d.delete()); }
        if (this.system._dep && this.uuid) { game.teriock?.dependents.untrack(this.system._dep, this); }
        // If this is deleted as part of a folder it might not call the appropriate operation and descendents need
        // to be deleted separately. This sucks but IDK a better solution.
        this.constructor.deleteDocuments(this.allSubs.contents.map(s => s._id), {
          pack: this.compendium?.collection,
          parent: this.parent,
        });
        this.#renderSheets();
      }

      /** @inheritDoc */
      _onUpdate(data, options, userId) {
        super._onUpdate(data, options, userId);
        this.#renderSheets();
      }

      /** @inheritDoc */
      async _preCreate(data, options, user) {
        const yes = await super._preCreate(data, options, user);
        if (yes === false) { return false; }

        const elder = await this.getElder();
        const valid = await this.constructor.validateRelationship(elder, this);
        if (!valid) { return false; }
      }

      /** @inheritDoc */
      async _preUpdate(changes, options, user) {
        const yes = await super._preUpdate(changes, options, user);
        if (yes === false) { return false; }

        const _sup = foundry.utils.getProperty(changes, "system._sup");
        if (_sup) {
          const collection = this.siblingCollection;
          const sup = await resolveDocument(collection?.get(_sup));
          const valid = await this.constructor.validateRelationship(sup, this);
          if (!valid) { return false; }
        }
      }

      /** @inheritDoc */
      checkAncestor(doc) {
        if (doc?.uuid === this.uuid) { return true; }
        else { return this.elder?.checkAncestor ? this.elder?.checkAncestor(doc) || false : false; }
      }

      /** @inheritDoc */
      async createChildDocuments(embeddedName, data = [], operation = {}) {
        if (embeddedName === this.documentName) { return await this.createSubDocuments(data, operation); }
        else { return super.createChildDocuments(embeddedName, data, operation); }
      }

      /**
       * Create multiple dependent Document instances in this document's actor using provided input data. All
       * created documents will be dependent on this one. The operation fails silently if this does not have an actor.
       * @param {ChildDocumentName} embeddedName
       * @param {object[]} data
       * @param {Partial<DatabaseCreateOperation>} operation
       * @return {Promise<AnyChildDocument[]>}
       */
      async createDependentDocuments(embeddedName, data = [], operation = {}) {
        if (!this.actor) { return []; }
        data = foundry.utils.deepClone(data);
        for (const doc of data) { foundry.utils.setProperty(doc, "system._dep", this.id); }
        return this.actor.createEmbeddedDocuments(embeddedName, data, operation);
      }

      /**
       * Create multiple sub Document instances in a sup Document's collection using provided input data.
       * @param {object[]} data
       * @param {Partial<DatabaseCreateOperation & Teriock.System._CreateOperation>} operation
       * @returns {Promise<AnyChildDocument[]>}
       */
      async createSubDocuments(data = [], operation = {}) {
        data = foundry.utils.deepClone(data);
        for (const doc of data) {
          foundry.utils.setProperty(doc, "system._sup", this.id);
          foundry.utils.setProperty(doc, "folder", this.folder?.id || null);
        }
        if (this.parent) { return this.parent.createEmbeddedDocuments(this.documentName, data, operation); }
        else {
          if (this.inCompendium) { operation.pack = this.collection.collection; }
          return foundry.utils.getDocumentClass(this.documentName).createDocuments(data, operation);
        }
      }

      /** @inheritDoc */
      async deleteChildDocuments(embeddedName, ids = [], operation = {}) {
        if (embeddedName === this.documentName) { return this.deleteSubDocuments(ids, operation); }
        else { return super.deleteChildDocuments(embeddedName, ids, operation); }
      }

      /**
       * Delete multiple sub Document instances in a sup Document's collection using provided string ids.
       * @param {ID<AnyCommonDocument>[]} ids
       * @param {DatabaseDeleteOperation} operation
       * @returns {Promise<AnyCommonDocument[]>}
       */
      async deleteSubDocuments(ids = [], operation = {}) {
        ids = ids.filter(id => this.subs.map(s => s._id).includes(id));
        if (this.parent) { return this.parent.deleteEmbeddedDocuments(this.documentName, ids, operation); }
        else {
          if (this.inCompendium) { operation.pack = this.collection.collection; }
          return foundry.utils.getDocumentClass(this.documentName).deleteDocuments(ids, operation);
        }
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

      /**
       * The document that provides this document.
       * @returns {Promise<AnyCommonDocument|void>}
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
       * @returns {Promise<AnyCommonDocument|void>}
       */
      async getSup() {
        return resolveDocument(this.sup);
      }

      /** @inheritDoc */
      prepareData() {
        super.prepareData();
        if (this.system._dep && this.uuid) { game.teriock?.dependents.track(this.system._dep, this); }
      }

      /** @inheritDoc */
      toObject(source = true) {
        const out = super.toObject(source);
        if (this.collection) { foundry.utils.setProperty(out, "system._ref", this.uuid); }
        return out;
      }

      /**
       * Update multiple child Document instances descendant from a Document using provided differential data.
       * @param {ChildDocumentName} embeddedName
       * @param {object[]} updates
       * @param {DatabaseUpdateOperation} operation
       * @returns {Promise<AnyCommonDocument[]>}
       */
      async updateChildDocuments(embeddedName, updates = [], operation = {}) {
        if (embeddedName === this.documentName) { return this.updateSubDocuments(updates, operation); }
        else { return super.updateChildDocuments(embeddedName, updates, operation); }
      }

      /**
       * Update multiple sub Document instances in a sup Document's collection using provided differential data.
       * @param {object[]} updates
       * @param {DatabaseUpdateOperation} operation
       * @returns {Promise<AnyCommonDocument[]>}
       */
      async updateSubDocuments(updates = [], operation = {}) {
        updates = updates.filter(update => this.subs.map(s => s._id).includes(update._id));
        if (this.parent) { return this.parent.updateEmbeddedDocuments(this.documentName, updates, operation); }
        else {
          if (this.inCompendium) { operation.pack = this.collection?.collection; }
          return foundry.utils.getDocumentClass(this.documentName).updateDocuments(updates, operation);
        }
      }
    }
  );
}
