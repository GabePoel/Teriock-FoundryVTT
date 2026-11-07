import { migrateStatuses } from "../../data/fields/tools/migrations.mjs";
import { consolidateWriteOperations, mixClasses } from "../../utils/_module.mjs";
import { TypeCollection } from "../collections/_module.mjs";
import { BaseDocumentMixin, ChildDocumentMixin, CommonDocumentMixin } from "../mixins/_module.mjs";

const { ActiveEffect } = foundry.documents;

/**
 * The Teriock ActiveEffect implementation.
 * @extends {ActiveEffect}
 * @mixes BaseDocument
 * @mixes CommonDocument
 * @mixes ChildDocument
 */
export default class TeriockActiveEffect
  extends mixClasses(ActiveEffect, BaseDocumentMixin, CommonDocumentMixin, ChildDocumentMixin)
{
  /** @inheritDoc */
  static _applyChangeUnguided(targetDoc, change, changes, options = {}) {
    // Restrict changes to just structured data fields, flags, and token properties. Yoinked from Ryuutama.
    if (!change.key || !(change.key.startsWith?.("flags.") || (targetDoc.documentName === "Token"))) { return; }
    return super._applyChangeUnguided(targetDoc, change, changes, options);
  }

  /**
   * @inheritDoc
   * @category Dependents
   */
  static async _onCreateOperation(documents, operation, user) {
    await super._onCreateOperation(documents, operation, user);
    const editable = documents.filter(d => d.actor && d.checkEditor(user));
    const transformations = editable.filter(d => d.system.isTransformation);
    const operations = (await Promise.all(transformations.map(d => d.system.getCreateTransformationOperations())))
      .flat();
    for (const d of editable) {
      const dependents = operation.dependents?.[d.id];
      if (dependents?.length) { operations.push(d.getCreateDependentDocumentsOperation("Item", dependents)); }
    }
    if (operations.length) { foundry.documents.modifyBatch(consolidateWriteOperations(operations)); }
  }

  /**
   * @inheritDoc
   * @category Dependents
   */
  static async _onDeleteOperation(documents, operation, user) {
    await super._onDeleteOperation(documents, operation, user);
    const editable = documents.filter(d => d.actor && d.checkEditor(user));
    editable.sort((a, b) => b._stats.createdTime - a._stats.createdTime);
    const operations = editable.flatMap(
      d => [
        ...(d.system.isTransformation ? d.system.getTransformationOperations(false) : []),
        d.dependents.size ? d.getDeleteDependentDocumentsOperation("Item", d.dependents.map(i => i.id)) : null,
      ]
    );
    if (operations.length) { foundry.documents.modifyBatch(consolidateWriteOperations(operations)); }
  }

  /** @inheritDoc */
  static async _onUpdateOperation(documents, operation, user) {
    await super._onUpdateOperation(documents, operation, user);
    const toggled = documents.filter(d =>
      d.actor && d.checkEditor(user) && d.system.isTransformation
      && foundry.utils.hasProperty(operation.updates.find(u => u._id === d.id) ?? {}, "disabled")
    );
    toggled.sort((a, b) => b._stats.createdTime - a._stats.createdTime);
    const operations = toggled.flatMap(d => d.system.getTransformationOperations(!d.disabled));
    if (operations.length) { foundry.documents.modifyBatch(consolidateWriteOperations(operations)); }
  }

  /** @inheritDoc */
  static applyChange(targetDoc, change, options = {}) {
    if (foundry.utils.getProperty(targetDoc, "system.lockedPaths")?.has(change.key)) { return {}; }
    const changed = super.applyChange(targetDoc, change, options);
    if (changed[change.key] === undefined) { return {}; }
    return changed;
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    const description = foundry.utils.getProperty(source, "system.description");
    if (description && !source.description) { source.description = description; }
    foundry.utils.deleteProperty(source, "system.description");
    migrateStatuses(source, "statuses");
    return super.migrateData(source, options);
  }

  /** @inheritDoc */
  get _childrenSource() {
    return [...super._childrenSource, ...this.dependents.contents];
  }

  /** @inheritDoc */
  get isExpiryTrackable() {
    if (this.metadata.tags.untrackable) { return false; }
    return super.isExpiryTrackable;
  }

  /**
   * Whether this effect is a reference and not "real". Lazily recomputed.
   * @returns {boolean}
   */
  get isReference() {
    return this._cache.isReference ??= Boolean(this.system.isReference);
  }

  /**
   * Whether this is a status effect. Lazily computed. Doesn't need to be recomputed since ID doesn't change.
   * @returns {boolean}
   */
  get isStatus() {
    if (this._cache.isStatus === undefined) {
      this._cache.isStatus = Object.values(CONFIG.statusEffects).some(s => s?._id === this.id);
    }
    return this._cache.isStatus;
  }

  /** @inheritDoc */
  get isTemporary() {
    if (this.metadata.tags.untrackable) { return false; }
    return super.isTemporary;
  }

  /**
   * The time remaining before this effect expires, as a string.
   * @returns {string|null}
   */
  get remainingString() {
    return this.duration.remaining < Infinity
      ? this.duration.label
      : _loc("TERIOCK.SYSTEMS.BaseEffect.PANELS.noTimeLimit");
  }

  /**
   * @inheritDoc
   * @category Dependents
   */
  _configure(options = {}) {
    Object.defineProperties(this, {
      /**
       * Collection of the Items that depend on this even though they are embedded in a parallel Collection.
       * @type {TypeCollection<TeriockItem>}
       */
      dependents: {
        value: new TypeCollection("dependents", this, [], { documentClass: Item.implementation }),
        writable: false,
      },
    });
    super._configure(options);
  }

  /**
   * @inheritDoc
   * @category Dependents
   */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    options.dependents ??= {};
    options.dependents[this._id] = foundry.utils.getProperty(this, "flags._teriock.dependents") ?? [];
  }

  /**
   * Create multiple dependent Document instances in this document's actor using provided input data. All
   * created documents will be dependent on this one. The operation fails silently if this does not have an actor.
   * @param {"Item"} embeddedName
   * @param {object[]} data
   * @param {Partial<DatabaseCreateOperation>} operation
   * @returns {Promise<(TeriockActiveEffect|TeriockItem)[]>}
   */
  async createDependentDocuments(embeddedName, data = [], operation = {}) {
    const op = this.getCreateDependentDocumentsOperation(embeddedName, data, operation);
    if (!op) { return []; }
    const out = await foundry.documents.modifyBatch([op]);
    return out[0];
  }

  /**
   * @inheritDoc
   * @category Dependents
   */
  getCreateChildDocumentsOperation(embeddedName, data = [], operation = {}) {
    if (embeddedName === "Item") { return this.getCreateDependentDocumentsOperation(embeddedName, data, operation); }
    return super.getCreateChildDocumentsOperation(embeddedName, data, operation);
  }

  /**
   * Get the operation to create dependent Documents in this document's actor. Returns null if this does not have
   * an actor, so that the operation fails silently.
   * @param {"Item"} embeddedName
   * @param {object[]} data
   * @param {Partial<DatabaseCreateOperation>} operation
   * @returns {Partial<DatabaseCreateOperation>|null}
   * @category Dependents
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

  /** @inheritDoc */
  getDeleteChildDocumentsOperation(embeddedName, ids = [], operation = {}) {
    if (embeddedName === "Item") { return this.getDeleteDependentDocumentsOperation(embeddedName, ids, operation); }
    return super.getDeleteChildDocumentsOperation(embeddedName, ids, operation);
  }

  /**
   * Get the operation to delete dependent Documents from this document's actor. Returns null if this does not have
   * an actor, so that the operation fails silently.
   * @param {"Item"} embeddedName
   * @param {ID<TeriockActiveEffect|TeriockItem>[]} ids
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

  /** @inheritDoc */
  getUpdateChildDocumentsOperation(embeddedName, updates = [], operation = {}) {
    if (embeddedName === "Item") { return this.getUpdateDependentDocumentsOperation(embeddedName, updates, operation); }
    return super.getUpdateChildDocumentsOperation(embeddedName, updates, operation);
  }

  /**
   * Get the operation to update dependent Documents in this document's actor. Returns null if this does not have
   * an actor, so that the operation fails silently.
   * @param {"Item"} embeddedName
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

  /** @inheritDoc */
  resetChildMaps() {
    super.resetChildMaps();
    delete this._cache.isReference;
  }

  /**
   * @inheritDoc
   * @category Dependents
   */
  toObject(source = true) {
    return Object.assign(super.toObject(source), { dependents: this.dependents.map(d => d.toObject(source)) });
  }
}
