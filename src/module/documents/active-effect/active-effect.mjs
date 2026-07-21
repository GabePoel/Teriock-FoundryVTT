import { migrateUuid, migrateValueTransform } from "../../data/migrations/source-migrations.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { ActiveEffect } = foundry.documents;

/**
 * The Teriock ActiveEffect implementation.
 * @implements {Teriock.Documents.ActiveEffectInterface}
 * @extends {ActiveEffect}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @mixes ChildDocument
 * @mixes CommonDocument
 * @mixes DependeeDocument
 * @mixes RetrievalDocument
 */
export default class TeriockActiveEffect
  extends mixClasses(
    ActiveEffect,
    documentMixins.BaseDocumentMixin,
    documentMixins.CommonDocumentMixin,
    documentMixins.ChildDocumentMixin,
    documentMixins.DependeeDocumentMixin,
    documentMixins.RetrievalDocumentMixin,
  )
{
  /** @inheritDoc */
  static _applyChangeUnguided(targetDoc, change, changes, options = {}) {
    // Restrict changes to just structured data fields, flags, and token properties. Yoinked from Ryuutama.
    if (!change.key || !(change.key.startsWith?.("flags.") || (targetDoc.documentName === "Token"))) { return; }
    return super._applyChangeUnguided(targetDoc, change, changes, options);
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    migrateValueTransform(source, "_stats.compendiumSource", migrateUuid);
    return super.migrateData(source, options, state);
  }

  /**
   * Whether this effect is a reference and not "real". Lazily recomputed.
   * @returns {boolean}
   */
  get isReference() {
    if (this._cache.isReference === undefined) { this._cache.isReference = Boolean(this.system.isReference); }
    return this._cache.isReference;
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

  /**
   * The time remaining before this effect expires, as a string.
   * @returns {string|null}
   */
  get remainingString() {
    return this.duration.remaining < Infinity
      ? this.duration.label
      : _loc("TERIOCK.SYSTEMS.BaseEffect.PANELS.noTimeLimit");
  }

  /** @inheritDoc */
  async disable() {
    await this.update({ disabled: true });
  }

  /** @inheritDoc */
  async enable() {
    await this.update({ disabled: false });
  }

  /** @inheritDoc */
  getCreateChildDocumentsOperation(embeddedName, data = [], operation = {}) {
    if (embeddedName === "Item") { return this.getCreateDependentDocumentsOperation(embeddedName, data, operation); }
    return super.getCreateChildDocumentsOperation(embeddedName, data, operation);
  }

  /** @inheritDoc */
  getDeleteChildDocumentsOperation(embeddedName, ids = [], operation = {}) {
    if (embeddedName === "Item") { return this.getDeleteDependentDocumentsOperation(embeddedName, ids, operation); }
    return super.getDeleteChildDocumentsOperation(embeddedName, ids, operation);
  }

  /** @inheritDoc */
  getUpdateChildDocumentsOperation(embeddedName, updates = [], operation = {}) {
    if (embeddedName === "Item") { return this.getUpdateDependentDocumentsOperation(embeddedName, updates, operation); }
    return super.getUpdateChildDocumentsOperation(embeddedName, updates, operation);
  }

  /** @inheritDoc */
  resetChildMaps() {
    super.resetChildMaps();
    delete this._cache.isReference;
  }

  /** @inheritDoc */
  async toggleDisabled() {
    await this.update({ disabled: !this.disabled });
  }
}
