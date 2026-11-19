import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin, ChildDocumentMixin, CommonDocumentMixin } from "../mixins/_module.mjs";

const { Item } = foundry.documents;

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
    return [...super._previewedSource, ...this.effects.filter(e => e.elder?.type === "imbuement")];
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
  *allApplicableEffects() {
    for (const effect of this.effects) { if (!effect.isReference) { yield effect; } }
  }

  /** @inheritDoc */
  getChangesFromEffect(effect) {
    return effect.system.itemChanges;
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
    if (this.isTop) {
      this.applyActiveEffects("setup");
      this.applyActiveEffects("main");
      this.prepareSpecialData();
      this.applyActiveEffects("final");
    }
  }

  /** @inheritDoc */
  prepareEmbeddedDocuments() {
    super.prepareEmbeddedDocuments();
    this.applyActiveEffects("initial");
  }

  /** @inheritDoc */
  renderRelativeSheets() {
    super.renderRelativeSheets();
    if (this.dependee?.isViewer) { this.dependee.render(); }
  }
}
