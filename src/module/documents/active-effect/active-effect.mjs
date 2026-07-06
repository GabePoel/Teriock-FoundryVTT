import { migrateUuid, migrateValueTransform } from "../../data/migrations/source-migrations.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { ActiveEffect } = foundry.documents;

/**
 * The Teriock ActiveEffect implementation.
 * @extends {Teriock.Documents.ActiveEffectInterface}
 * @extends {ActiveEffect}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @mixes ChildDocument
 * @mixes CommonDocument
 * @mixes RetrievalDocument
 */
export default class TeriockActiveEffect
  extends mixClasses(
    ActiveEffect,
    documentMixins.BaseDocumentMixin,
    documentMixins.CommonDocumentMixin,
    documentMixins.ChildDocumentMixin,
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

  /** @type {boolean} */
  _isReference;

  /** @type {boolean} */
  _isStatus;

  /**
   * Whether this effect is a reference and not "real". Lazily recomputed.
   * @returns {boolean}
   */
  get isReference() {
    if (this._isReference === undefined) { this._isReference = Boolean(this.system.isReference); }
    return this._isReference;
  }

  /**
   * Whether this is a status effect. Lazily computed. Doesn't need to be recomputed since ID doesn't change.
   * @returns {boolean}
   */
  get isStatus() {
    if (this._isStatus === undefined) {
      this._isStatus = Object.values(CONFIG.statusEffects).some(s => s?._id === this.id);
    }
    return this._isStatus;
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
  async createChildDocuments(embeddedName, data = [], operation = {}) {
    if (embeddedName === "Item") { return this.createDependentDocuments(embeddedName, data, operation); }
    return super.createChildDocuments(embeddedName, data, operation);
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
  resetChildMaps() {
    super.resetChildMaps();
    delete this._isReference;
  }

  /** @inheritDoc */
  async toggleDisabled() {
    await this.update({ disabled: !this.disabled });
  }
}
