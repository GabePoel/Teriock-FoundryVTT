import { makeIcon } from "../../helpers/icon.mjs";
import { resolveDocument } from "../../helpers/resolve.mjs";
import { toId, toKebabCase } from "../../helpers/string.mjs";

/**
 * Base mixin.
 * @param {typeof Foundry.ClientDocument} Base
 * @mixin
 */
export default function BaseDocumentMixin(Base) {
  return (
    /**
     * @extends {Foundry.ClientDocument}
     * @mixin
     */
    class BaseDocument extends Base {
      /**
       * Metadata that Teriock uses but Foundry doesn't.
       * @returns {Teriock.Documents.DocumentMetadata}
       */
      static get documentMetadata() {
        return { child: false, common: false, dependee: false, hierarchy: false, parent: false, tooltip: false };
      }

      /**
       * Mutate an operation that's being conducted as the GM.
       * @param {DatabaseWriteOperation & Teriock.System._Operation} operation
       */
      static _cleanGMOperation(operation) {
        delete operation.asGM;
        if (operation.parent) {
          operation.parentUuid = operation.parent.uuid;
          delete operation.parent;
        }
      }

      /**
       * @inheritDoc
       * @param {TeriockItem[]} documents
       * @param {DatabaseCreateOperation & Teriock.System._CreateOperation} operation
       * @param {TeriockUser} user
       * @returns {Promise<boolean|void>}
       */
      static async _onCreateOperation(documents, operation, user) {
        await this._onWriteOperation(documents, operation, user);
        return super._onCreateOperation(documents, operation, user);
      }

      /**
       * @inheritDoc
       * @param {TeriockItem[]} documents
       * @param {DatabaseDeleteOperation & Teriock.System._Operation} operation
       * @param {TeriockUser} user
       * @returns {Promise<void>}
       */
      static async _onDeleteOperation(documents, operation, user) {
        await this._onWriteOperation(documents, operation, user);
        return super._onDeleteOperation(documents, operation, user);
      }

      /**
       * @inheritDoc
       * @param {TeriockItem[]} documents
       * @param {DatabaseUpdateOperation & Teriock.System._Operation} operation
       * @param {TeriockUser} user
       * @returns {Promise<void>}
       */
      static async _onUpdateOperation(documents, operation, user) {
        await this._onWriteOperation(documents, operation, user);
        return super._onUpdateOperation(documents, operation, user);
      }

      /**
       * Post-process any write operation, reacting to database changes which have occurred. Post-operation events
       * occur for all connected clients. This is up to individual document classes to implement.
       * @param {TeriockDocument[]} _documents
       * @param {DatabaseWriteOperation & Teriock.System._Operation} _operation
       * @param {TeriockUser} _user
       * @returns {Promise<void>}
       */
      static async _onWriteOperation(_documents, _operation, _user) {}

      /**
       * @param {object[]} data
       * @param {Partial<Omit<DatabaseCreateOperation, "data"> & Teriock.System._CreateOperation>} operation
       * @inheritDoc
       */
      static async createDocuments(data = [], operation = {}) {
        if (operation.asGM && !game.user.isGM) {
          this._cleanGMOperation(operation);
          const docs = await game.users.queryGM("teriock.createDocuments", {
            data,
            documentName: this.documentName,
            operation,
          }, { timeout: TERIOCK.config.system.timeout.writeOperation });
          if (!docs) { return data.map(_d => null); }
          return Promise.all(docs.map(d => fromUuid(d)));
        }
        return super.createDocuments(data, operation);
      }

      /**
       * @param {string[]} ids
       * @param {Partial<Omit<DatabaseDeleteOperation, "ids"> & Teriock.System._Operation>} operation
       * @inheritDoc
       */
      static async deleteDocuments(ids = [], operation = {}) {
        if (operation.asGM && !game.user.isGM) {
          this._cleanGMOperation(operation);
          const docs = await game.users.queryGM("teriock.deleteDocuments", {
            documentName: this.documentName,
            ids,
            operation,
          }, { timeout: TERIOCK.config.system.timeout.writeOperation });
          if (!docs) { return ids.map(_d => null); }
          return docs;
        }
        return super.deleteDocuments(ids, operation);
      }

      /**
       * @param {object[]} updates
       * @param {Partial<Omit<DatabaseUpdateOperation, "updates"> & Teriock.System._Operation>} operation
       * @inheritDoc
       */
      static async updateDocuments(updates = [], operation = {}) {
        if (operation.asGM && !game.user.isGM) {
          this._cleanGMOperation(operation);
          const docs = await game.users.queryGM("teriock.updateDocuments", {
            documentName: this.documentName,
            operation,
            updates,
          }, { timeout: TERIOCK.config.system.timeout.writeOperation });
          if (!docs) { return updates.map(_d => null); }
          return Promise.all(docs.map(d => fromUuid(d)));
        }
        return super.updateDocuments(updates, operation);
      }

      /**
       * Prefix to use in {@link _benchmarkStart} and {@link _benchmarkEnd}.
       * @returns {string}
       */
      get _benchmarkString() {
        return `${this.name}.${this.type}.${toId(this.collection ? this.uuid : this.name, { hash: true })}`;
      }

      /**
       * The default identifier for this document.
       * @returns {Identifier}
       */
      get defaultIdentifier() {
        return tm.string.toKebabCase(this.name);
      }

      /** @returns {Teriock.Documents.DocumentMetadata} */
      get documentMetadata() {
        return this.constructor.documentMetadata;
      }

      /**
       * A guaranteed identifier for this.
       * @returns {Identifier}
       */
      get forcedIdentifier() {
        return this.system?.identifier ?? this.defaultIdentifier;
      }

      /**
       * A modified version of this document's name that displays additional text if needed.
       * @returns {string}
       */
      get fullName() {
        return this.system?.fullName || this.name;
      }

      /**
       * Whether this document shouldn't have its basic information like compendium source and identifier visible.
       * @return {boolean}
       */
      get isSecret() {
        if (this.system) { return this.system.isSecret; }
        return false;
      }

      /**
       * If this is the top of an embedded document hierarchy.
       * @returns {boolean}
       */
      get isTop() {
        return !this.isEmbedded;
      }

      /**
       * Can this be viewed?
       * @returns {boolean}
       */
      get isViewer() {
        return this.testUserPermission(game.user, "LIMITED");
      }

      /**
       * A key that can be looked up to find this document.
       * @returns {string}
       */
      get lookupKey() {
        if (this.typedIdentifier) { return this.typedIdentifier; }
        if (this.type) { return `${this.type}:${this.forcedIdentifier}`; }
        return `${toKebabCase(this.documentName)}:${this.forcedIdentifier}`;
      }

      /**
       * That document that has the most control over this one.
       * @return {Teriock.Hierarchy.SyncDoc<AnyCommonDocument>}
       */
      get master() {
        return this.parent;
      }

      /**
       * The pseudo-document collections.
       * @returns {Record<string, TypeCollection>}
       */
      get pseudoCollections() {
        return this.system?.pseudoCollections ?? {};
      }

      /**
       * Whether this is the actual document persisted to the database and not a sneaky clone.
       * @returns {boolean}
       */
      get trackable() {
        return this.collection?.get(this.id) === this;
      }

      /**
       * This document's typed identifier, if it has one.
       * @returns {TypedIdentifier|null}
       */
      get typedIdentifier() {
        const type = this.type;
        const identifier = this.system?.identifier;
        return Boolean(type) && Boolean(identifier) ? `${type}:${identifier}` : null;
      }

      /**
       * Helper to start a benchmark.
       * @param {string} key
       */
      _benchmarkEnd(key) {
        console.timeEnd(`${key} - ${this._benchmarkString}`);
      }

      /**
       * Helper to end a benchmark.
       * @param {string} key
       */
      _benchmarkStart(key) {
        console.time(`${key} - ${this._benchmarkString}`);
      }

      /**
       * Check whether it's valid for this document to be edited from another one. This is mainly intended for use
       * in {@link getCardContextMenuEntries}. If this document appears as an embedded card (via `@EMBED`) or
       * otherwise has its context menu entries shown in a sheet for some document, only some of them should be visible.
       * @param {TeriockDocument} doc
       * @param {object} [options]
       * @param {boolean} [options.editable] - Require the document's sheet to be editable.
       * @param {boolean} [options.self] - Whether the document must or must not be this one.
       * @returns {boolean}
       */
      _checkValidEditorDocument(doc, options = {}) {
        const { editable = true, self = undefined } = options;
        if (self === false && doc === this) { return false; }
        if (self === true && doc !== this) { return false; }
        return (this.isOwner
          && (this.checkAncestor(doc) || this.master === doc || this === doc)
          && (doc?.sheet?.isEditable || !editable || ["consequence", "imbuement"].includes(this.type)));
      }

      /** @inheritDoc */
      _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        // Extra tracking for world documents created during the game.
        game.teriock.identifiers.trackDocument(this);
        this._cachedIdentifier = this.typedIdentifier;
      }

      /** @inheritDoc */
      _onDelete(options, userId) {
        super._onDelete(options, userId);
        game.teriock.identifiers.untrackDocument(this);
        for (const c of Object.values(this.collections)) {
          for (const d of c) { game.teriock.identifiers.untrackDocument(d); }
        }
      }

      /**
       * Check whether the provided document or its index is an ancestor of this one.
       * @param {TeriockDocument|Teriock.Hierarchy.Index<TeriockDocument>} doc
       */
      checkAncestor(doc) {
        if (doc?.uuid === this.uuid) { return true; }
        return this.parent?.checkAncestor(doc) || false;
      }

      /**
       * Check if the {@link TeriockUser} owns and uses this.
       * @param  {TeriockUser | ID<TeriockUser>} user
       * @returns {false|boolean|boolean|*}
       */
      checkEditor(user) {
        return game.user.id === (user.id || user._id || user) && this.isOwner;
      }

      /**
       * Context menu entries to display for cards that represent this document.
       * @param {TeriockDocument} doc
       * @returns {ContextMenuEntry[]}
       */
      getCardContextMenuEntries(doc) {
        /** @type {ContextMenuEntry[]} */
        const entries = [];
        if (this.system?.getCardContextMenuEntries) { entries.push(...this.system.getCardContextMenuEntries(doc)); }
        entries.push(...[{
          group: "open",
          icon: makeIcon(TERIOCK.display.icons.ui.openWindow, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Common.MENU.openSource"),
          onClick: async () => {
            const resolved = await resolveDocument(this.master);
            if (resolved) { await resolved.sheet?.render(true); }
          },
          visible: () => this.master?.isViewer && doc?.uuid !== this.master?.uuid,
        }, {
          group: "document",
          icon: makeIcon(TERIOCK.display.icons.ui.delete, "contextMenu"),
          label: _loc("COMMON.Delete"),
          onClick: async () => await this.deleteDialog({ modal: true }, { interactive: true }),
          visible: () =>
            this._checkValidEditorDocument(doc)
            || (this.inCompendium && !this.compendium.locked && !this.parent && this.sup?.uuid === doc?.uuid),
        }]);
        return entries;
      }

      /** @inheritdoc */
      getEmbeddedCollection(embeddedName) {
        return this.pseudoCollections[embeddedName] ?? super.getEmbeddedCollection(embeddedName);
      }

      /** @inheritDoc */
      prepareData() {
        super.prepareData();
        if (this.trackable) { game.teriock.identifiers.untrack(this._cachedIdentifier, this.uuid); }
        if (this.persisted) { game.teriock.identifiers.trackDocument(this); }
        this._cachedIdentifier = this.typedIdentifier;
      }

      /** @inheritDoc */
      toDragData() {
        return Object.assign(super.toDragData(), { identifier: this.typedIdentifier, systemType: this.type });
      }
    }
  );
}
