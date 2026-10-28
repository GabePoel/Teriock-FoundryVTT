import { migratePowerKinds } from "../../data/fields/tools/migrations.mjs";
import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin, ChildDocumentMixin, CommonDocumentMixin } from "../mixins/_module.mjs";

const { Item } = foundry.documents;

/**
 * @import { ActiveEffectChangeData } from "@client/documents/_types.mjs";
 */

/**
 * The Teriock Item implementation.
 * @extends {Item}
 * @mixes BaseDocument
 * @mixes CommonDocument
 * @mixes ChildDocument
 */
export default class TeriockItem extends mixClasses(Item, BaseDocumentMixin, CommonDocumentMixin, ChildDocumentMixin) {
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
  static migrateData(source, options) {
    migratePowerKinds(source);
    return super.migrateData(source, options);
  }

  /**
   * This document's dependee.
   * @type {TeriockActiveEffect|null}
   * @category Dependents
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

  /**
   * @inheritDoc
   * @category Dependents
   */
  get master() {
    return this.dependee || super.master;
  }

  /** @inheritDoc */
  _clearData() {
    super._clearData();
    this._completedActiveEffectPhases = new Set();
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
      if (effect.disabled) { continue; }
      for (const change of effect.system.itemChanges) {
        if (change.key === "" || change.phase !== phase || !(effect.active || change.applyIfSuppressed)) { continue; }
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

  /**
   * @inheritDoc
   * @category Dependents
   */
  prepareBaseData() {
    this.dependee = this.actor?.effects.get(this.system._dep) ?? null;
    this.dependee?.dependents.set(this.id, this);
    super.prepareBaseData();
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.isTop) { this.applyActiveEffects(TERIOCK.CONFIG.change.defaultPhase); }
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
