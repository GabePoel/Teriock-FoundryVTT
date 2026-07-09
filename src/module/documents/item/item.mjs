import { mixClasses } from "../../helpers/construction.mjs";
import TeriockActiveEffect from "../active-effect/active-effect.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { Item } = foundry.documents;

/**
 * The Teriock Item implementation.
 * @implements {Teriock.Documents.ItemInterface}
 * @extends {ClientDocument}
 * @extends {Item}
 * @mixes BaseDocument
 * @mixes ChildDocument
 * @mixes CommonDocument
 * @mixes ParentDocument
 * @mixes RetrievalDocument
 */
export default class TeriockItem
  extends mixClasses(
    Item,
    documentMixins.BaseDocumentMixin,
    documentMixins.CommonDocumentMixin,
    documentMixins.ChildDocumentMixin,
    documentMixins.ParentDocumentMixin,
    documentMixins.RetrievalDocumentMixin,
  )
{
  /** @inheritDoc */
  static async _onWriteOperation(documents, operation, user) {
    if (documents.some(d => d.checkEditor(user))) {
      const actors = new Set();
      for (const d of documents) { if (d.actor) { actors.add(d.actor); } }
      const operations = (await Promise.all(actors.map(a => a._getStagedOperations()))).flat();
      await foundry.documents.modifyBatch(operations);
    }
    await super._onWriteOperation(documents, operation, user);
  }

  /** @inheritDoc */
  static getDefaultArtwork(itemData) {
    return { img: this.getDefaultImageForType(itemData?.type) };
  }

  /**
   * Checks if the item is active.
   * @returns {boolean}
   */
  get active() {
    return !this.isSuppressed && !this.disabled;
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
   * @returns {AnyActiveEffect[]}
   */
  get validEffects() {
    return this.effects.contents;
  }

  /**
   * @inheritDoc
   * @yields {TeriockActiveEffect}
   * @returns {Generator<AnyActiveEffect, void, void>}
   */
  *allApplicableEffects() {
    for (const effect of this.effects) { yield effect; }
  }

  /**
   * Apply any transformations to the Item data which are caused by ActiveEffects.
   * @param phase
   */
  applyActiveEffects(phase) {
    if (!(phase in TeriockActiveEffect.CHANGE_PHASES)) { return; }
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
      const result = TeriockActiveEffect.applyChange(this, change, { replacementData });
      if (foundry.utils.isPlainObject(result)) { Object.assign(overrides, result); }
    }
    foundry.utils.mergeObject(this.overrides, foundry.utils.expandObject(overrides));
  }

  /** @inheritDoc */
  prepareBaseData() {
    this.overrides = {};
    super.prepareBaseData();
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.isTop) { this.applyActiveEffects(TERIOCK.config.change.defaultPhase); }
  }
}
