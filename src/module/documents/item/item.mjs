import { mixClasses } from "../../helpers/construction.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { Item } = foundry.documents;

/**
 * @import { ActiveEffectChangeData } from "@client/documents/_types.mjs";
 */

/**
 * The Teriock Item implementation.
 * @mixes BaseDocument
 * @mixes CommonDocument
 * @mixes ChildDocument
 * @mixes RetrievalDocument
 */
export default class TeriockItem
  extends mixClasses(
    Item,
    documentMixins.BaseDocumentMixin,
    documentMixins.CommonDocumentMixin,
    documentMixins.ChildDocumentMixin,
    documentMixins.RetrievalDocumentMixin,
  )
{
  /** @inheritDoc */
  static async _onWriteOperation(documents, operation, user) {
    const actors = new Set();
    for (const d of documents) { if (d.actor && d.checkEditor(user)) { actors.add(d.actor); } }
    if (actors.size) {
      const operations = (await Promise.all(actors.map(a => a._getStagedOperations()))).flat();
      await foundry.documents.modifyBatch(operations);
    }
    await super._onWriteOperation(documents, operation, user);
  }

  /** @inheritDoc */
  static getDefaultArtwork(itemData) {
    const img = itemData?.img ?? this.getDefaultImageForType(itemData?.type);
    return { img };
  }

  /**
   * This document's dependee.
   * @type {TeriockActiveEffect|null};
   */
  dependee;

  /** @inheritDoc */
  get _childrenSource() {
    return [...super._childrenSource, ...(this.effects?.contents || []).filter(e => !e.sup)];
  }

  /** @inheritDoc */
  get _previewedSource() {
    return [...super._previewedSource, ...this.effects.contents.filter(e => e.elder?.type === "imbuement")];
  }

  /**
   * Checks if the item is active.
   * @returns {boolean}
   */
  get active() {
    return !this.isSuppressed;
  }

  /**
   * Checks if the item is disabled.
   * @returns {boolean} True if the item is disabled, false otherwise.
   */
  get disabled() {
    return this.system.disabled;
  }

  /** @inheritDoc */
  get master() {
    return this.dependee || super.master;
  }

  /**
   * Get all ActiveEffects that may apply to this document.
   * @yields {TeriockActiveEffect}
   * @returns {Generator<TeriockActiveEffect, void, void>}
   */
  *allApplicableEffects() {
    for (const effect of this.effects) { if (!effect.isReference) { yield effect; } }
  }

  /**
   * Apply any transformations to the Item data which are caused by ActiveEffects.
   * @param {string} phase
   */
  applyActiveEffects(phase) {
    if (!(phase in ActiveEffect.implementation.CHANGE_PHASES) || this._completedActiveEffectPhases.has(phase)) {
      return;
    }
    this._completedActiveEffectPhases.add(phase);
    /** @type {ActiveEffectChangeData[]} */
    const changes = [];
    for (const effect of this.allApplicableEffects()) {
      if (!effect.active) { continue; }
      for (const change of effect.system.itemChanges) {
        if (change.key === "" || change.phase !== phase) { continue; }
        const copy = foundry.utils.deepClone(change);
        copy.effect = effect;
        changes.push(copy);
      }
    }
    changes.sort((a, b) => a.priority - b.priority);
    const overrides = {};
    const replacementData = this.getRollData();
    for (const change of changes) {
      const result = ActiveEffect.implementation.applyChange(this, change, { replacementData });
      if (foundry.utils.isPlainObject(result)) { Object.assign(overrides, result); }
    }
    foundry.utils.mergeObject(this.overrides, foundry.utils.expandObject(overrides));
  }

  /** @inheritDoc */
  prepareBaseData() {
    this.overrides = {};
    this._completedActiveEffectPhases = new Set();
    if (this.system._dep?.length === 16) {
      const dependee = this.actor?.effects.get(this.system._dep);
      if (dependee) {
        dependee.dependents.set(this.id, this);
        this.dependee = dependee;
      } else { this.dependee = null; }
    }
    super.prepareBaseData();
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.isTop) { this.applyActiveEffects(TERIOCK.config.change.defaultPhase); }
  }

  /** @inheritDoc */
  prepareEmbeddedDocuments() {
    super.prepareEmbeddedDocuments();
    this.applyActiveEffects("setup");
  }

  /** @inheritDoc */
  renderRelativeSheets() {
    super.renderRelativeSheets();
    if (this.dependee?.isViewer) { this.dependee.render(); }
  }
}
