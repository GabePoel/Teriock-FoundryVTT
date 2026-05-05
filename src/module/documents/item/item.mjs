import { mix } from "../../helpers/construction.mjs";
import * as mixins from "../mixins/_module.mjs";

const { Item } = foundry.documents;

//noinspection JSUnresolvedReference,JSClosureCompilerSyntax,JSValidateJSDoc
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
export default class TeriockItem extends mix(
  Item,
  mixins.BaseDocumentMixin,
  mixins.CommonDocumentMixin,
  mixins.ChildDocumentMixin,
  mixins.ParentDocumentMixin,
  mixins.RetrievalDocumentMixin,
) {
  /** @inheritDoc */
  static get documentMetadata() {
    return Object.assign(super.documentMetadata, {
      types: Object.keys(CONFIG.Item.dataModels),
    });
  }

  /**
   * @inheritDoc
   * @param {TeriockItem[]} documents
   * @param {DatabaseCreateOperation & Teriock.System._CreateOperation} operation
   * @param {TeriockUser} user
   * @returns {Promise<boolean|void>}
   */
  static async _onCreateOperation(documents, operation, user) {
    const actors = new Set();
    for (const d of documents) if (d.actor) actors.add(d.actor);
    await Promise.all(actors.map((a) => a._processStagedItemCreations()));
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
    const actors = new Set();
    for (const d of documents) if (d.actor) actors.add(d.actor);
    await Promise.all(actors.map((a) => a._processStagedItemDeletions()));
    return super._onDeleteOperation(documents, operation, user);
  }

  /**
   * @inheritDoc
   * @param {TeriockItem[]} documents
   * @param {DatabaseCreateOperation & Teriock.System._CreateOperation} operation
   * @param {TeriockUser} user
   * @returns {Promise<boolean|void>}
   */
  static async _preCreateOperation(documents, operation, user) {
    for (const d of documents.filter((d) => d.actor)) {
      d.actor._stagedItemCreations = new Set();
    }
    return super._preCreateOperation(documents, operation, user);
  }

  /**
   * @inheritDoc
   * @param {TeriockItem[]} documents
   * @param {DatabaseDeleteOperation & Teriock.System._Operation} operation
   * @param {TeriockUser} user
   * @returns {Promise<boolean|void>}
   */
  static async _preDeleteOperation(documents, operation, user) {
    for (const d of documents.filter((d) => d.actor)) {
      d.actor._stagedItemDeletions = new Set();
    }
    return super._preDeleteOperation(documents, operation, user);
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

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) return false;

    const elder = await this.getElder();
    if (elder && !elder.metadata.childItemTypes.includes(this.type)) {
      return false;
    }
  }

  /**
   * @inheritDoc
   * @yields {TeriockActiveEffect}
   * @returns {Generator<AnyActiveEffect, void, void>}
   */
  *allApplicableEffects() {
    for (const effect of this.effects) yield effect;
  }

  /**
   * Apply any transformations to the Item data which are caused by ActiveEffects.
   * @param phase
   */
  applyActiveEffects(phase) {
    const ActiveEffect = foundry.documents.ActiveEffect.implementation;
    if (!(phase in ActiveEffect.CHANGE_PHASES)) return;
    /** @type {ActiveEffectChangeData[]} */
    const changes = [];
    for (const effect of this.allApplicableEffects()) {
      if (!effect.active) continue;
      for (const change of effect.system.itemChanges) {
        if (change.key === "" || change.phase !== phase) continue;
        const copy = foundry.utils.deepClone(change);
        copy.effect = effect;
        changes.push(copy);
      }
    }
    changes.sort((a, b) => a.priority - b.priority);
    const overrides = {};
    const replacementData = this.getRollData();
    for (const change of changes) {
      const result = ActiveEffect.applyChange(this, change, {
        replacementData,
      });
      if (foundry.utils.isPlainObject(result)) Object.assign(overrides, result);
    }
    foundry.utils.mergeObject(
      this.overrides,
      foundry.utils.expandObject(overrides),
    );
  }

  /** @inheritDoc */
  prepareBaseData() {
    this.overrides = {};
    super.prepareBaseData();
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.isTop) this.applyActiveEffects(TERIOCK.config.change.defaultPhase);
  }
}
