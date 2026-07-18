import { buildWriteOperation, consolidateWriteOperations } from "../../helpers/utils.mjs";

/**
 * Document mixin for documents that other documents can be dependent on. Dependents are documents that have some sort
 * of ownership relationship with this one without being subs or embedded children of it. The relationship is stored on
 * the dependent as `system._dep` and tracked by the {@link DependentsRegistry}.
 *
 * This mixin covers the dependee (owning) side of that relationship. The dependent side lives in
 * {@link HierarchyDocumentMixin}, since any document can be a dependent even if it can't own dependents itself.
 *
 * @param {typeof BaseDocument} Base
 */
export default function DependeeDocumentMixin(Base) {
  return (
    /**
     * @extends AnyCommonDocument
     * @mixin
     */
    class DependeeDocument extends Base {
      /** @inheritDoc */
      static get documentMetadata() {
        return Object.assign(super.documentMetadata, { dependee: true });
      }

      /**
       * Array of dependent documents.
       * @return {AnyChildDocument[]}
       */
      get dependents() {
        return game.teriock?.dependents.get(this);
      }

      /** @inheritDoc */
      _makeChildArray() {
        return [...super._makeChildArray(), ...this.dependents];
      }

      /** @inheritDoc */
      _onDelete(options, userId) {
        super._onDelete(options, userId);
        if (game.user.isActiveGM) {
          Promise.all(this.dependents.map((d) => buildWriteOperation({ action: "delete", uuid: d.uuid }))).then(
            (operations) => {
              const consolidatedOperations = consolidateWriteOperations(operations.filter(Boolean));
              if (operations.length) { foundry.documents.modifyBatch(consolidatedOperations); }
            },
          );
        }
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
        const op = this.getCreateDependentDocumentsOperation(embeddedName, data, operation);
        if (!op) { return []; }
        const out = await foundry.documents.modifyBatch([op]);
        return out[0];
      }

      /**
       * Get the operation to create dependent Documents in this document's actor. Returns null if this does not have
       * an actor, so that the operation fails silently.
       * @param {ChildDocumentName} embeddedName
       * @param {object[]} data
       * @param {Partial<DatabaseCreateOperation>} operation
       * @returns {Partial<DatabaseCreateOperation>|null}
       */
      getCreateDependentDocumentsOperation(embeddedName, data = [], operation = {}) {
        if (!this.actor) { return null; }
        data = foundry.utils.deepClone(data);
        for (const d of data) { foundry.utils.setProperty(d, "system._dep", this.id); }
        return {
          ...operation,
          action: "create",
          data,
          documentName: embeddedName,
          pack: this.actor.pack,
          parent: this.actor,
        };
      }

      /**
       * Get the operation to delete dependent Documents from this document's actor. Returns null if this does not have
       * an actor, so that the operation fails silently.
       * @param {ChildDocumentName} embeddedName
       * @param {ID<AnyChildDocument>[]} ids
       * @param {Partial<DatabaseDeleteOperation & Teriock.System._Operation>} operation
       * @returns {Partial<DatabaseDeleteOperation & Teriock.System._Operation>|null}
       */
      getDeleteDependentDocumentsOperation(embeddedName, ids = [], operation = {}) {
        if (!this.actor) { return null; }
        return {
          ...operation,
          action: "delete",
          documentName: embeddedName,
          ids,
          pack: this.actor.pack,
          parent: this.actor,
        };
      }

      /**
       * Get the operation to update dependent Documents in this document's actor. Returns null if this does not have
       * an actor, so that the operation fails silently.
       * @param {ChildDocumentName} embeddedName
       * @param {object[]} updates
       * @param {Partial<DatabaseUpdateOperation & Teriock.System._Operation>} operation
       * @returns {Partial<DatabaseUpdateOperation & Teriock.System._Operation>|null}
       */
      getUpdateDependentDocumentsOperation(embeddedName, updates = [], operation = {}) {
        if (!this.actor) { return null; }
        return {
          ...operation,
          action: "update",
          documentName: embeddedName,
          pack: this.actor.pack,
          parent: this.actor,
          updates,
        };
      }
    }
  );
}
