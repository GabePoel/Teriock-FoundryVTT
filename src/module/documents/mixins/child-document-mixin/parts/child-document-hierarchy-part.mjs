export default (Base) => {
  return (
    /**
     * @extends ClientDocument
     */
    class ChildDocumentHierarchyPart extends Base {
      /**
       * Change the IDs for many client children consistently.
       * @param {TeriockChild[]} children - Client documents.
       * @param {Record<string,string>} idMap - Mapping of old IDs to new IDs.
       * @param {string} rootUuid - UUID for the parent {@link TeriockActor} or {@link TeriockItem} document.
       * @returns {TeriockChild[]}
       * @private
       */
      static _changeChildIds(children, idMap, rootUuid) {
        const oldIds = Object.keys(idMap);
        return children.map((oldChild) => {
          const newChild = /** @type {TeriockChild} */ oldChild.clone();
          const updateData = {
            "system.hierarchy.rootUuid": rootUuid,
          };
          if (oldIds.includes(oldChild.id)) {
            updateData["_id"] = idMap[oldChild.id];
          }
          if (oldChild.metadata.hierarchy) {
            if (oldIds.includes(oldChild.system.hierarchy.supId)) {
              updateData["system.hierarchy.supId"] =
                idMap[oldChild.system.hierarchy.supId];
            }
            const newSubIds = new Set();
            for (const oldId of oldChild.system.hierarchy.subIds) {
              newSubIds.add(idMap[oldId]);
            }
            updateData["system.hierarchy.subIds"] = newSubIds;
          }
          newChild.updateSource(updateData);
          return newChild;
        });
      }

      //noinspection JSUnusedGlobalSymbols
      /**
       * Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events
       * only occur for the client which requested the operation. This batch-wise workflow occurs after individual
       * {@link _preCreate} workflows and provides a final pre-flight check before a database operation occurs.
       * Modifications to pending documents must mutate the documents array or alter individual document instances
       * using
       * {@link updateSource}.
       * @param {TeriockChild[]} documents - Pending document instances to be created
       * @param {DatabaseCreateOperation} operation - Parameters of the database creation operation
       * @param {TeriockUser} user - The User requesting the creation operation
       * @returns {Promise<boolean|void>} - Return false to cancel the creation operation entirely
       * @protected
       */
      static async _preCreateOperation(documents, operation, user) {
        await super._preCreateOperation(documents, operation, user);
        /** @type {TeriockChild[]} */
        if (operation.parent) {
          const toCreate = [];
          for (const supChildren of documents) {
            const newSupId = foundry.utils.randomID();
            toCreate.push(supChildren);
            if (supChildren?.metadata.hierarchy) {
              supChildren.updateSource({ _id: newSupId });
              if (supChildren.rootSubIds.size > 0) {
                const oldSupId = supChildren.rootSubs[0].system.hierarchy.supId;
                const subChildren = supChildren.rootAllSubs;
                const idMap = {};
                for (const id of subChildren.map((sub) => sub.id)) {
                  idMap[id] = foundry.utils.randomID();
                }
                idMap[oldSupId] = newSupId;
                const newSubs = this._changeChildIds(
                  subChildren,
                  idMap,
                  operation.parent.uuid,
                );
                supChildren.updateSource({
                  "system.hierarchy.subIds": supChildren.rootSubIds.map(
                    (oldId) => idMap[oldId],
                  ),
                });
                toCreate.push(...newSubs);
              }
              supChildren.updateSource({
                "system.hierarchy.rootUuid": operation.parent.uuid,
              });
              operation.keepId = true;
            }
          }
          documents.length = 0;
          documents.push(...toCreate);
        }
      }

      //noinspection JSUnusedGlobalSymbols
      /**
       * Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events
       * only occur for the client which requested the operation. This batch-wise workflow occurs after individual
       * {@link _preDelete} workflows and provides a final pre-flight check before a database operation occurs.
       * Modifications to the requested deletions are performed by mutating the operation object.
       * {@link updateSource}.
       * @param {TeriockChild[]} documents - Document instances to be deleted
       * @param {DatabaseDeleteOperation} operation - Parameters of the database update operation
       * @param {TeriockUser} user - The User requesting the deletion operation
       * @returns {Promise<boolean|void>} - Return false to cancel the deletion operation entirely
       * @protected
       */
      static async _preDeleteOperation(documents, operation, user) {
        await super._preDeleteOperation(documents, operation, user);
        if (operation.parent) {
          for (const supChild of documents) {
            if (supChild?.metadata.hierarchy) {
              operation.ids.push(
                ...Array.from(supChild.allSubs.map((e) => e.id)),
              );
            }
          }
        }
      }

      /**
       * Gets all sub-children descendants from this child recursively.
       * @returns {TeriockChild[]} Array of all descendant children.
       */
      get allSubs() {
        const allSubChildren = [];
        const subChildren = this.subs;
        for (const subChild of subChildren) {
          allSubChildren.push(subChild);
          allSubChildren.push(...subChild.allSubs);
        }
        return allSubChildren;
      }

      /**
       * Gets all children that this child is a sub-child of.
       * @returns {TeriockChild[]} Array of super-children, ordered from immediate sup to top level.
       */
      get allSups() {
        const supChildren = [];
        let supChild = this.sup;
        if (supChild) {
          supChildren.push(supChild);
          supChildren.push(...supChild.allSups);
        }
        return supChildren;
      }

      /**
       * Gets all sub-child descendants from this child recursively via its root.
       * @returns {TeriockChild[]} Array of all descendant children.
       */
      get rootAllSubs() {
        const allSubChildren = [];
        const subChildren = this.rootSubs;
        for (const subEffect of subChildren) {
          allSubChildren.push(subEffect);
          allSubChildren.push(...subEffect.allSubs);
        }
        return allSubChildren;
      }

      /**
       * Safely gets the IDS of all sub-children that are derived from this child via its root.
       * @returns {Set<Teriock.ID<TeriockChild>>}
       */
      get rootSubIds() {
        if (this.metadata.hierarchy && this.system.hierarchy.subIds.size > 0) {
          const root = /** @type {TeriockParent} */ fromUuidSync(
            this.system.hierarchy.rootUuid,
          );
          return this.system.hierarchy.subIds.filter((id) =>
            root.effects.has(id),
          );
        }
        return new Set();
      }

      /**
       * Gets all sub-children that are derived from this child via it's root.
       * @returns {TeriockChild[]}
       */
      get rootSubs() {
        /** @type {TeriockChild[]} */
        const subChildren = [];
        for (const id of this.rootSubIds) {
          const root = /** @type {TeriockParent} */ fromUuidSync(
            this.system.hierarchy.rootUuid,
          );
          subChildren.push(root[this.metadata.collection].get(id));
        }
        return subChildren;
      }

      /**
       * Gets the document that most directly applies this child. If it's a child, return that.
       * Otherwise, gets what Foundry considers to be the parent.
       * @returns {TeriockCommon} The source document that applies this child.
       */
      get source() {
        let source = this.sup;
        if (!source) {
          source = this.parent;
        }
        return source;
      }

      /**
       * Safely gets the IDS of all sub-children that are derived from this child.
       * @returns {Set<Teriock.ID<TeriockChild>>}
       */
      get subIds() {
        if (
          this.metadata.hierarchy &&
          this.system.hierarchy.subIds.size > 0 &&
          this.parent
        ) {
          const root = this.parent;
          return this.system.hierarchy.subIds.filter((id) =>
            root[this.metadata.collection].has(id),
          );
        }
        return new Set();
      }

      /**
       * Gets all sub-children that are derived from this child.
       * @returns {TeriockChild[]}
       */
      get subs() {
        /** @type {TeriockChild[]} */
        const subChildren = [];
        for (const id of this.subIds) {
          const root = this.parent;
          subChildren.push(root[this.metadata.collection].get(id));
        }
        return subChildren;
      }

      /**
       * Gets the child that provides this child if there is one.
       * @returns {TeriockChild|null}
       */
      get sup() {
        if (this.supId) {
          return /** @type {TeriockChild} */ this.parent.getEmbeddedDocument(
            this.documentName,
            this.supId,
          );
        }
        return null;
      }

      /**
       * Safely gets the ID of the child that provides this child if there is one.
       * @returns {Teriock.ID<TeriockChild>}
       */
      get supId() {
        if (
          this.metadata.hierarchy &&
          this.system.hierarchy.supId &&
          this.parent &&
          this.parent[this.metadata.collection].has(this.system.hierarchy.supId)
        ) {
          return this.system.hierarchy.supId;
        }
        return null;
      }

      /**
       * Add a sub-child to this one.
       * @param {TeriockChild} sub
       * @returns {Promise<void>}
       */
      async addSub(sub) {
        if (this.metadata.hierarchy && sub.metadata.hierarchy) {
          const newSubIds = this.subIds;
          newSubIds.add(sub.id);
          await this.parent.updateEmbeddedDocuments(this.documentName, [
            {
              _id: this.id,
              "system.hierarchy.subIds": newSubIds,
            },
            {
              _id: sub.id,
              "system.hierarchy.supId": this.id,
            },
          ]);
        }
      }

      /**
       * Add multiple sub-children to this one.
       * @param {TeriockChild[]} subs
       * @returns {Promise<void>}
       */
      async addSubs(subs) {
        subs = subs.filter((s) => s.metadata.hierarchy);
        if (this.metadata.hierarchy) {
          const newSubIds = this.subIds;
          for (const s of subs) {
            newSubIds.add(s.id);
          }
          await this.parent.updateEmbeddedDocuments(this.documentName, [
            {
              _id: this.id,
              "system.hierarchy.subIds": newSubIds,
            },
            ...subs.map((s) => {
              return {
                _id: s.id,
                "system.hierarchy.supId": this.id,
              };
            }),
          ]);
        }
      }

      /**
       * Deletes all sub-children and clears the sub IDs from this child.
       * @returns {Promise<void>} Promise that resolves when all subs are deleted.
       */
      async deleteSubs() {
        if (this.subIds.size > 0) {
          await this.parent?.deleteEmbeddedDocuments(
            this.documentName,
            Array.from(this.subIds),
          );
          await this.update({
            "system.hierarchy.subIds": new Set(),
          });
        }
      }

      /**
       * @inheritDoc
       * @returns {Promise<TeriockChild>}
       */
      async duplicate() {
        const copy = /** @type {TeriockChild} */ await super.duplicate();
        const sup = copy.sup;
        if (sup) {
          await sup.addSub(copy);
        }
      }
    }
  );
};
