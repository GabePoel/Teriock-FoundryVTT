//noinspection JSUnusedGlobalSymbols

import {
  resolveCollection,
  resolveDocument,
  resolveDocuments,
} from "../../../helpers/utils.mjs";
import { TypeCollection } from "../../collections/_module.mjs";

const { Collection } = foundry.utils;

/**
 * Document mixin to support hierarchies of the same document type.
 * @param {typeof BaseDocument} Base
 * @constructor
 */
export default function HierarchyDocumentMixin(Base) {
  return (
    /**
     * @extends TeriockCommon
     * @property {{ _sup: ID<HierarchyDocument> }} system
     * @mixin
     */
    class HierarchyDocument extends Base {
      /**
       * @inheritDoc
       * @param {TeriockCommon[]} documents
       * @param {DatabaseCreateOperation & Teriock.System._DatabaseCreateOperation} operation
       * @param {TeriockUser} user
       * @returns {Promise<boolean|void>}
       * @private
       */
      static async _preCreateOperation(documents, operation, user) {
        if (
          (await super._preCreateOperation(documents, operation, user)) ===
          false
        ) {
          return false;
        }
        const keepId = operation.keepId;
        const toCreate = [];
        for (const doc of documents) {
          if (doc.system._ref) {
            const ref = await fromUuid(doc.system._ref);
            if (ref && ref.subs.size) {
              operation.keepId = true;
              const newDoc = doc.clone({}, { keepId });
              if (!keepId) {
                newDoc.updateSource({ _id: foundry.utils.randomID() });
              }
              toCreate.push(newDoc);
              /** @type {Record<ID<TeriockCommon>, ID<TeriockCommon>>} */
              const idMap = { [ref.id]: newDoc._id };
              const allRefSubs = await ref.getAllSubs();
              const clones = [];
              for (const sub of allRefSubs.contents) {
                const subClone = sub.clone(
                  { folder: newDoc.folder },
                  { keepId },
                );
                if (!subClone._id && !operation.keepSubIds) {
                  subClone.updateSource({ _id: foundry.utils.randomID() });
                }
                idMap[sub.id] = subClone._id;
                clones.push(subClone);
              }
              for (const clone of clones) {
                clone.updateSource({
                  "system._sup": idMap[clone.system._sup],
                });
              }
              toCreate.push(...clones);
            } else {
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
       * @param {TeriockCommon[]} documents
       * @param {DatabaseDeleteOperation} operation
       * @param {TeriockUser} user
       * @returns {Promise<boolean|void>}
       * @private
       */
      static async _preDeleteOperation(documents, operation, user) {
        if (
          (await super._preDeleteOperation(documents, operation, user)) ===
          false
        ) {
          return false;
        }
        for (const doc of documents) {
          operation.ids.push(...doc.allSubs.contents.map((s) => s._id));
        }
      }

      /** @inheritDoc */
      checkAncestor(doc) {
        if (doc?.uuid === this.uuid) {
          return true;
        } else {
          return this.elder?.checkAncestor
            ? this.elder?.checkAncestor(doc) || false
            : false;
        }
      }

      /**
       * @inheritDoc
       * @param {TeriockCommon[]} documents
       * @param {DatabaseUpdateOperation} operation
       * @param {TeriockUser} user
       * @returns {Promise<boolean|void>}
       * @private
       */
      static async _preUpdateOperation(documents, operation, user) {
        if (
          (await super._preUpdateOperation(documents, operation, user)) ===
          false
        ) {
          return false;
        }
        for (const doc of documents) {
          const folderUpdate = operation.updates.find(
            (update) =>
              update._id === doc._id &&
              foundry.utils.hasProperty(update, "folder"),
          );
          if (folderUpdate) {
            const subIds = doc.allSubs.contents.map((s) => s._id);
            for (const subId of subIds) {
              const supUpdate = operation.updates.find(
                (update) => update._id === subId,
              );
              if (!supUpdate) {
                operation.updates.push({
                  _id: subId,
                  folder: folderUpdate.folder,
                });
              } else {
                supUpdate.folder = folderUpdate.folder;
              }
            }
          }
        }
      }

      /**
       * Get all findSubs for a given document.
       * @param {TeriockCommon|Index<TeriockCommon>} document
       * @param {Collection} [collection]
       * @returns {TypeCollection}
       */
      static findAllSubs(document, collection) {
        if (this.findSubs(document, collection).size === 0) {
          return new TypeCollection();
        }
        return new TypeCollection(
          this.findSubs(document, collection)
            .contents.flatMap((s) => [s, ...this.findAllSubs(s, collection)])
            .map((s) => [s._id, s]),
        );
      }

      /**
       * Get all sups for a given document.
       * @param {TeriockCommon|Index<TeriockCommon>} document
       * @param {Collection} [collection]
       * @returns {TypeCollection}
       */
      static findAllSups(document, collection) {
        if (!this.findSup(document, collection)) {
          return new TypeCollection();
        }
        return new TypeCollection(
          [this.findSup(document, collection)]
            .concat(
              this.findAllSups(this.findSup(document, collection))?.contents ||
                [],
            )
            .map((d) => [d._id, d]),
        );
      }

      /**
       * Get findSubs for a given document.
       * @param {TeriockCommon|Index<TeriockCommon>} document
       * @param {Collection} [collection]
       * @returns {TypeCollection}
       */
      static findSubs(document, collection) {
        if (!collection) {
          collection = document.siblingCollection;
        }
        const subArray = collection.filter(
          (d) => foundry.utils.getProperty(d, "system._sup") === document._id,
        );
        return new TypeCollection(subArray.map((d) => [d._id, d]));
      }

      /**
       * The findSup for a given document.
       * @param {TeriockCommon|Index<TeriockCommon>} document
       * @param {Collection} collection
       * @returns {TeriockCommon|undefined}
       */
      static findSup(document, collection) {
        if (!collection) {
          collection = document.siblingCollection;
        }
        if (document.system?._sup) {
          return collection.get(document.system._sup);
        }
      }

      /**
       * All the findSubs descendant of this document or their indexes.
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
       * @returns {TeriockChild[]}
       */
      get childArray() {
        return [
          ...(this.effects?.contents || []).filter((e) => !e.sup),
          ...(this.items?.contents || []).filter((i) => !i.sup),
          ...(this.subs.contents || []),
        ];
      }

      /**
       * Collection containing all children or their indexes.
       * @returns {TypeCollection}
       */
      get children() {
        return new TypeCollection(this.childArray.map((c) => [c._id, c]));
      }

      /**
       * The document that most directly provides this one.
       * @returns {SyncDoc<TeriockCommon>}
       */
      get elder() {
        return this.sup || this.parent;
      }

      /**
       * The collection that contains this and its siblings or their indexes.
       * @returns {Collection<ID<HierarchyDocument>, HierarchyDocument>}
       */
      get siblingCollection() {
        let collection = this.collection;
        if (collection?.index instanceof Collection) {
          collection = collection.index;
        }
        return collection;
      }

      /**
       //* The findSubs of this document or their indexes.
       * @returns {TypeCollection}
       */
      get subs() {
        return HierarchyDocument.findSubs(this, this.siblingCollection);
      }

      /**
       * The findSup of this document or its index.
       * @returns {SyncDoc<TeriockCommon>|undefined}
       */
      get sup() {
        return HierarchyDocument.findSup(this, this.siblingCollection);
      }

      /** @inheritDoc */
      get visible() {
        return super.visible && !this.sup;
      }

      /**
       * Array containing all visible children.
       * @returns {TeriockChild[]}
       */
      get visibleChildren() {
        return this.childArray
          .filter((c) => !c.isEphemeral)
          .filter(
            (c) =>
              c.documentName !== "ActiveEffect" ||
              c.system.revealed ||
              game.user.isGM,
          );
      }

      /**
       * Render the sheets of all the sups.
       */
      #renderSupSheets() {
        this.getAllSups().then((result) => {
          result.forEach((doc) => {
            if (doc.isViewer) {
              doc.sheet.render({ force: false }).then();
            }
          });
        });
        if (this.collection.name === "CompendiumCollection") {
          this.collection.apps.forEach((app) => {
            if (app.rendered) {
              app.render().then();
            }
          });
        }
      }

      /** @inheritDoc */
      _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        this.#renderSupSheets();
      }

      /** @inheritDoc */
      _onDelete(data, options, userId) {
        super._onDelete(data, options, userId);
        this.#renderSupSheets();
      }

      /** @inheritDoc */
      _onUpdate(data, options, userId) {
        super._onUpdate(data, options, userId);
        this.#renderSupSheets();
      }

      /**
       * Create multiple child Document instances descendant from a Document using provided input data.
       * @param {TeriockChildName} embeddedName
       * @param {object[]} data
       * @param {DatabaseCreateOperation & Teriock.System._DatabaseCreateOperation} operation
       * @returns {Promise<TeriockCommon[]>}
       */
      async createChildDocuments(embeddedName, data = [], operation = {}) {
        if (embeddedName === this.documentName) {
          return await this.createSubDocuments(data, operation);
        } else {
          return await this.createEmbeddedDocuments(
            embeddedName,
            data,
            operation,
          );
        }
      }

      /**
       * Create multiple sub Document instances in a findSup Document's collection using provided input data.
       * @param {object[]} data
       * @param {DatabaseCreateOperation & Teriock.System._DatabaseCreateOperation} operation
       * @returns {Promise<TeriockCommon[]>}
       */
      async createSubDocuments(data = [], operation = {}) {
        data = foundry.utils.deepClone(data);
        for (const doc of data) {
          foundry.utils.setProperty(doc, "system._sup", this.id);
          foundry.utils.setProperty(doc, "folder", this.folder?.id || null);
        }
        if (this.parent) {
          return await this.parent.createEmbeddedDocuments(
            this.documentName,
            data,
            operation,
          );
        } else {
          if (this.inCompendium) {
            operation.pack = this.collection.collection;
          }
          return await foundry.utils
            .getDocumentClass(this.documentName)
            .createDocuments(data, operation);
        }
      }

      /**
       * Delete multiple child Document instances descendant from a Document using provided string ids.
       * @param {TeriockChildName} embeddedName
       * @param {ID<TeriockCommon>[]} ids
       * @param {DatabaseDeleteOperation} operation
       * @returns {Promise<TeriockCommon>}
       */
      async deleteChildDocuments(embeddedName, ids = [], operation = {}) {
        if (embeddedName === this.documentName) {
          return await this.deleteSubDocuments(ids, operation);
        } else {
          return await this.deleteEmbeddedDocuments(
            embeddedName,
            ids,
            operation,
          );
        }
      }

      /**
       * Delete multiple sub Document instances in a findSup Document's collection using provided string ids.
       * @param {ID<TeriockCommon>[]} ids
       * @param {DatabaseDeleteOperation} operation
       * @returns {Promise<TeriockCommon[]>}
       */
      async deleteSubDocuments(ids = [], operation = {}) {
        ids = ids.filter((id) => this.subs.map((s) => s.id).includes(id));
        if (this.parent) {
          return await this.parent.deleteEmbeddedDocuments(
            this.documentName,
            ids,
            operation,
          );
        } else {
          if (this.inCompendium) {
            operation.pack = this.collection.collection;
          }
          return await foundry.utils
            .getDocumentClass(this.documentName)
            .deleteDocuments(ids, operation);
        }
      }

      /**
       * All the findSubs descendant of this document.
       * @returns {Promise<TypeCollection>}
       */
      async getAllSubs() {
        return await resolveCollection(this.allSubs);
      }

      /**
       * All the sups ancestral to this document.
       * @returns {Promise<TypeCollection>}
       */
      async getAllSups() {
        return await resolveCollection(this.allSups);
      }

      /**
       * Resolved array containing all children.
       * @returns {Promise<TeriockCommon[]>}
       */
      async getChildArray() {
        return resolveDocuments(this.childArray);
      }

      /**
       * Resolved collection containing all children.
       * @returns {Promise<TypeCollection>}
       */
      async getChildren() {
        const children = await resolveDocuments(this.childArray);
        return new TypeCollection(children.map((c) => [c._id, c]));
      }

      /**
       * The document that provides this document.
       * @returns {Promise<TeriockCommon|void>}
       */
      async getElder() {
        return await resolveDocument(this.elder);
      }

      /**
       * The findSubs of this document.
       * @returns {Promise<TypeCollection>}
       */
      async getSubs() {
        return await resolveCollection(this.subs);
      }

      /**
       * The findSup of this document.
       * @returns {Promise<TeriockCommon|void>}
       */
      async getSup() {
        return await resolveDocument(this.sup);
      }

      /**
       * Resolved visible children.
       * @returns {Promise<TeriockCommon[]>}
       */
      async getVisibleChildren() {
        return resolveDocuments(this.visibleChildren);
      }

      /** @inheritDoc */
      toObject() {
        const out = super.toObject();
        foundry.utils.setProperty(out, "system._ref", this.uuid);
        return out;
      }

      /**
       * Update multiple child Document instances descendant from a Document using provided differential data.
       * @param {TeriockChildName} embeddedName
       * @param {object[]} updates
       * @param {DatabaseUpdateOperation} operation
       * @returns {Promise<TeriockCommon[]>}
       */
      async updateChildDocuments(embeddedName, updates = [], operation = {}) {
        if (embeddedName === this.documentName) {
          return await this.updateSubDocuments(updates, operation);
        } else {
          return await this.updateEmbeddedDocuments(
            embeddedName,
            updates,
            operation,
          );
        }
      }

      /**
       * Update multiple sub Document instances in a findSup Document's collection using provided differential data.
       * @param {object[]} updates
       * @param {DatabaseUpdateOperation} operation
       * @returns {Promise<TeriockCommon[]>}
       */
      async updateSubDocuments(updates = [], operation = {}) {
        updates = updates.filter((update) =>
          this.subs.map((s) => s.id).includes(update._id),
        );
        if (this.parent) {
          return await this.parent.updateEmbeddedDocuments(
            this.documentName,
            updates,
            operation,
          );
        } else {
          if (this.inCompendium) {
            operation.pack = this.collection.collection;
          }
          return await foundry.utils
            .getDocumentClass(this.documentName)
            .updateDocuments(updates, operation);
        }
      }
    }
  );
}
