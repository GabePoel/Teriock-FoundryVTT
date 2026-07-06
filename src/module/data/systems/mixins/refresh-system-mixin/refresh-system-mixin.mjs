import { fromIdentifier } from "../../../../helpers/utils.mjs";

/**
 * @typedef RefreshSourceNode
 * @property {AnyCommonDocument|null} document
 * @property {string} label
 */

/**
 * Mixin for refreshing documents from the source documents they were created from.
 * @param {typeof TypeDataModel} Base
 */
export default function RefreshSystemMixin(Base) {
  return (
    /**
     * @mixin
     */
    class RefreshSystem extends Base {
      /** @type {string[]} */
      static DEFAULT_PRESERVED_PROPERTIES = [
        "_id",
        "_stats",
        "flags",
        "folder",
        "origin",
        "ownership",
        "sort",
        "system._dep",
        "system._ref",
        "system._sup",
        "type",
      ];

      /** @type {string[]} */
      static PRESERVED_PROPERTIES = [...this.DEFAULT_PRESERVED_PROPERTIES];

      /**
       * Build a single batched database operation targeting children of this document, mirroring the routing that
       * {@link CommonDocument#createChildDocuments} and its siblings perform.
       * @param {"create"|"delete"|"update"} action
       * @param {ChildDocumentName} documentName
       * @param {object[]|ID<AnyChildDocument>[]} payload - Creation data, update deltas, or ids to delete.
       * @returns {DatabaseWriteOperation|null}
       */
      #childOperation(action, documentName, payload) {
        const doc = this.parent;
        let target = doc;
        if (documentName === doc.documentName) {
          // Subs share this document's collection rather than living in an embedded one.
          if (action === "create") {
            for (const data of payload) {
              foundry.utils.setProperty(data, "system._sup", doc.id);
              foundry.utils.setProperty(data, "folder", doc.folder?.id || null);
            }
          }
          target = doc.parent;
        } else if (doc.documentName === "ActiveEffect" && documentName === "Item") {
          // Dependent items live on the actor.
          if (!doc.actor) { return null; }
          if (action === "create") {
            for (const data of payload) { foundry.utils.setProperty(data, "system._dep", doc.id); }
          }
          target = doc.actor;
        }
        const payloadKey = { create: "data", delete: "ids", update: "updates" }[action];
        return {
          action,
          documentName,
          pack: (target ?? doc).pack ?? null,
          parent: target ?? null,
          [payloadKey]: payload,
        };
      }

      /**
       * Group documents by their document name.
       * @param {AnyChildDocument[]} documents
       * @returns {Record<ChildDocumentName, AnyChildDocument[]>}
       */
      #groupByDocumentName(documents) {
        const map = {};
        for (const doc of documents) { (map[doc.documentName] ??= []).push(doc); }
        return map;
      }

      /**
       * Merge batched operations that share an action and target so that each target is written to only once.
       * @param {DatabaseWriteOperation[]} operations
       * @returns {DatabaseWriteOperation[]}
       */
      #mergeRefreshOperations(operations) {
        const merged = new Map();
        for (const operation of operations) {
          const key = [operation.action, operation.documentName, operation.parent?.uuid, operation.pack].join("|");
          const existing = merged.get(key);
          if (!existing) {
            merged.set(key, operation);
            continue;
          }
          for (const field of ["data", "ids", "updates"]) {
            if (operation[field]) { existing[field].push(...operation[field]); }
          }
        }
        return Array.from(merged.values());
      }

      /**
       * The children considered when computing refresh deltas. With `fullOverride`, embedded children are replaced
       * by the refresh update itself, so only same-collection subs are considered.
       * @param {AnyCommonDocument} document
       * @param {boolean} fullOverride
       * @returns {Promise<AnyChildDocument[]>}
       */
      async #refreshChildren(document, fullOverride) {
        const children = await document.getChildArray();
        return fullOverride ? children.filter(c => c.sup?.uuid === document.uuid) : children;
      }

      /**
       * Whether refreshing from source may create missing children on this document.
       * @returns {boolean}
       */
      get _refreshCanCreateChildren() {
        return true;
      }

      /**
       * An array of unresolved promises that resolve to documents this could refresh from.
       * @returns {Promise<RefreshSourceNode>[]}
       */
      get _refreshPromises() {
        const promises = [];
        if (this.parent._stats.compendiumSource) {
          promises.push(
            this._formatRefreshPromise(
              fromUuid(this.parent._stats.compendiumSource),
              "TERIOCK.SHEETS.DocumentSettings.FIELDS.compendiumSource.label",
            ),
          );
        }
        if (this.parent._stats.duplicateSource) {
          promises.push(
            this._formatRefreshPromise(
              fromUuid(this.parent._stats.duplicateSource),
              "TERIOCK.SHEETS.DocumentSettings.FIELDS.duplicateSource.label",
            ),
          );
        }
        if (this.parent.typedIdentifier) {
          promises.push(
            this._formatRefreshPromise(
              fromIdentifier(this.parent.typedIdentifier),
              "TERIOCK.SYSTEMS.Rules.FIELDS.identifier.label",
            ),
          );
        }
        return promises;
      }

      /**
       * Format a refresh promise properly.
       * @param {Promise<AnyCommonDocument|null>} document
       * @param {string} label
       * @returns {Promise<RefreshSourceNode>}
       */
      async _formatRefreshPromise(document, label) {
        return { document: await document, label: _loc(label) };
      }

      /**
       * Recursively gather the database operations needed to refresh this document from a source document.
       * @param {AnyCommonDocument|null} document
       * @param {Partial<Teriock.System.RefreshOptions>} [options]
       * @returns {Promise<DatabaseWriteOperation[]>}
       */
      async _refreshOperations(document, options = {}) {
        const {
          createChildren = true,
          deleteChildren = true,
          fullOverride = false,
          recursive = true,
          updateChildren = true,
          updateDocument = true,
        } = options;
        const operations = [];
        const deletedIds = new Set();
        if (document && updateDocument) {
          const updateObject = this.toRefreshObject(document, options);
          updateObject._id = this.parent.id;
          delete updateObject.flags;
          // Replace automations wholesale so that ones missing from the source don't linger.
          if (foundry.utils.hasProperty(updateObject, "system.automations")) {
            updateObject.system.automations = _replace(updateObject.system.automations);
          }
          if (fullOverride) {
            updateObject.effects = _replace(updateObject.effects);
            updateObject.items = _replace(updateObject.items);
          }
          operations.push({
            action: "update",
            documentName: this.parent.documentName,
            pack: this.parent.pack ?? null,
            parent: this.parent.parent ?? null,
            updates: [updateObject],
          });
        }
        if (document && (createChildren || deleteChildren)) {
          const srcChildren = await this.#refreshChildren(document, fullOverride);
          const dstChildren = await this.#refreshChildren(this.parent, fullOverride);
          const srcKeys = new Set(srcChildren.map(c => c.lookupKey));
          const dstKeys = new Set(dstChildren.map(c => c.lookupKey));
          if (createChildren && this._refreshCanCreateChildren) {
            const createMap = this.#groupByDocumentName(srcChildren.filter(c => !dstKeys.has(c.lookupKey)));
            for (const [documentName, docs] of Object.entries(createMap)) {
              operations.push(this.#childOperation("create", documentName, docs.map(d => d.toObject(true))));
            }
          }
          if (deleteChildren) {
            const toDelete = dstChildren.filter(c => !srcKeys.has(c.lookupKey));
            for (const doc of toDelete) { deletedIds.add(doc.id); }
            const deleteMap = this.#groupByDocumentName(toDelete);
            for (const [documentName, docs] of Object.entries(deleteMap)) {
              operations.push(this.#childOperation("delete", documentName, docs.map(d => d.id)));
            }
          }
        }
        if (recursive || updateChildren) {
          // Children queued for creation are skipped.
          const children = await this.#refreshChildren(this.parent, fullOverride && this.metadata.hierarchy);
          for (const child of children) {
            if (deletedIds.has(child.id)) { continue; }
            const childSource = await fromUuid(child._stats.compendiumSource);
            operations.push(
              ...await child.system._refreshOperations(childSource, {
                createChildren: recursive && createChildren,
                deleteChildren: recursive && deleteChildren,
                recursive,
                updateChildren: recursive && updateChildren,
                updateDocument: updateChildren,
              }),
            );
          }
        }
        return operations.filter(Boolean);
      }

      /**
       * Get an array of documents which can be used to refresh this from.
       * @returns {Promise<RefreshSourceNode[]>}
       */
      async getRefreshSources() {
        const resolvedNodes = await Promise.all(this._refreshPromises);
        return resolvedNodes.filter(n => n.document && n.document.isViewer && n.document.uuid !== this.parent.uuid);
      }

      /**
       * Refresh this document (and optionally its children) from a source document. All the required database
       * operations are gathered recursively and submitted as one batched request.
       * @param {AnyCommonDocument} document
       * @param {Partial<Teriock.System.RefreshOptions>} [options]
       * @returns {Promise<void>}
       */
      async refreshFromSource(document, options = {}) {
        const operations = await this._refreshOperations(document, options);
        if (operations.length) { await foundry.documents.modifyBatch(this.#mergeRefreshOperations(operations)); }
      }

      /**
       * Get a refresh object from a document with the same type as this one.
       * @param {AnyCommonDocument} document
       * @param {Partial<Teriock.System.RefreshOptions>} [options]
       * @returns {object}
       */
      toRefreshObject(document, options = {}) {
        const obj = document?.toObject(true) ?? {};
        const preservedProperties = options.fullOverride
          ? this.constructor.DEFAULT_PRESERVED_PROPERTIES
          : this.metadata.preservedProperties;
        for (const p of preservedProperties || []) { foundry.utils.deleteProperty(obj, p); }
        return obj;
      }
    }
  );
}
