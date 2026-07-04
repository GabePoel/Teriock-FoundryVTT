import { config } from "../../constants/_module.mjs";
import { TriggerExpiration } from "../../data/pseudo-documents/expirations/_module.mjs";
import { BaseExpiration } from "../../data/pseudo-documents/expirations/abstract/_module.mjs";
import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { findBestDocument, fromKey } from "../../helpers/utils.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { Actor } = foundry.documents;

/**
 * The Teriock Actor implementation.
 * @implements {Teriock.Documents.ActorInterface}
 * @extends {Actor}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @mixes CommonDocument
 * @mixes ParentDocument
 * @mixes RetrievalDocument
 * @mixes PropagationData
 */
export default class TeriockActor
  extends mixClasses(
    Actor,
    documentMixins.BaseDocumentMixin,
    documentMixins.CommonDocumentMixin,
    documentMixins.ParentDocumentMixin,
    documentMixins.RetrievalDocumentMixin,
  )
{
  /** @inheritDoc */
  static getDefaultArtwork(actorData) {
    const img = this.getDefaultImageForType(actorData?.type);
    return { img, texture: { src: img } };
  }

  /**
   * The default weight for a given size.
   *
   * Relevant wiki pages:
   * - [Weight](https://wiki.teriock.com/index.php/Core:Weight)
   *
   * @param {number} size
   * @param {"min"|"typical"|"max"} [amount]
   * @returns {number}
   */
  static getDefaultWeight(size, amount = "typical") {
    if (amount === "min") { size -= 0.5; }
    if (amount === "max") { size += 0.5; }
    return Math.max(0.001, Math.pow(3 + size, 3));
  }

  /**
   * Get the definition of several fields for a given numerical size value.
   *
   * Relevant wiki pages:
   * - [Size](https://wiki.teriock.com/index.php/Core:Size)
   *
   * @param {number} size
   * @returns {Teriock.Config.SizeEntry}
   */
  static getSizeConfig(size) {
    const minCategoryMaxSize = Math.min(...config.character.sizes.map(d => d.max).filter(m => m >= size));
    return foundry.utils.deepClone(config.character.sizes.find(d => d.max === minCategoryMaxSize));
  }

  /** @type {AnyActiveEffect[]} */
  _modifiableChildren;

  /** @type {Set<UUID<TeriockItem>|TypedIdentifier>} */
  _stagedItemCreations = new Set();

  /** @type {Set<ID<TeriockItem>>} */
  _stagedItemDeletions = new Set();

  /** @type {AnyActiveEffect[]} */
  _validEffects;

  /**
   * Is this actor active?
   * @returns {boolean}
   */
  get active() {
    return true;
  }

  /**
   * Consequences and imbuements.
   * @returns {(TeriockConsequence|TeriockImbuement)[]}
   */
  get applicables() {
    return [...this.consequences, ...this.imbuements];
  }

  /**
   * Body parts and equipment.
   * @returns {TeriockArmament[]}
   */
  get armaments() {
    return [...this.bodyParts, ...this.equipment];
  }

  /**
   * Get the best token placeable for this actor.
   * @returns {TeriockToken|null}
   */
  get defaultToken() {
    if (this.token) { return this.token.object; }
    return this.getActiveTokens()[0] ?? null;
  }

  /**
   * Get the default user to perform updates on this actor. This is most important for updates that involve dialogs
   * or other approval. The idea is to be as specific as possible and avoid selecting the active GM wherever possible.
   * @returns {TeriockUser|null}
   */
  get defaultUser() {
    let selected;
    // See if any user has the actor as a character
    selected = game.users.active.find(u => u.character === this && this.canUserModify(u, "update"));
    // See if any players have control over the actor
    selected ??= game.users.active.find(u => !u.isActiveGM && this.canUserModify(u, "update"));
    // If all else fails, fall back to the active GM
    selected ??= game.users.activeGM;
    return selected;
  }

  /**
   * Checks if the actor is disabled (dead).
   * @returns {boolean} True if the actor is dead, false otherwise.
   */
  get disabled() {
    return this.statuses.has("dead");
  }

  /** @inheritDoc */
  get isTop() {
    return true;
  }

  /**
   * All modifiable children, visible or otherwise.
   * @returns {AnyActiveEffect[]}
   */
  get modifiableChildren() {
    if (!this._modifiableChildren) {
      this._modifiableChildren = [...this.validEffects, ...this.items.contents].filter(c => !c.isReference);
    }
    return this._modifiableChildren;
  }

  /**
   * @inheritDoc
   * @returns {AnyActiveEffect[]}
   */
  get validEffects() {
    if (!this._validEffects) { this._validEffects = Array.from(this.allApplicableEffects()); }
    return this._validEffects;
  }

  /**
   * Apply any transformations to child data which are caused by ActiveEffects.
   * @param {Teriock.Changes.Phase} phase
   * @internal
   */
  _applyActiveEffectsToChildren(phase) {
    if (!game.settings.get("teriock", "nonHierarchicalChanges")) { return; }
    /** @type {Record<string, Teriock.Changes.QualifiedChangeData[]>} */
    const changeMap = { ability: [], armament: [] };
    for (const effect of this.allApplicableEffects()) {
      if (!effect.active) { continue; }
      for (const change of effect.system.childChanges) {
        if (
          !change.qualifier
          || change.qualifier === "0"
          || change.key === ""
          || change.phase !== phase
          || !changeMap[change.target]
        ) {
          continue;
        }
        const copy = foundry.utils.deepClone(change);
        copy.effect = effect;
        changeMap[change.target].push(copy);
      }
    }
    for (const c of Object.values(changeMap)) { c.sort((a, b) => a?.priority - b?.priority); }
    const data = this.getRollData();
    this._applyChangesToDocuments(changeMap.ability, this.abilities, data);
    this._applyChangesToDocuments(changeMap.armament, this.armaments, data);
  }

  /**
   * Apply any transformations to item data which are causde by ActiveEffects.
   * @param {Teriock.Changes.Phase} phase
   * @internal
   */
  _applyActiveEffectsToItems(phase) {
    for (const item of this.items) { item.applyActiveEffects(phase); }
  }

  /**
   * Apply qualified changes to an array of documents.
   * @param {Teriock.Changes.QualifiedChangeData[]} changes
   * @param {AnyChildDocument[]} documents
   * @param {object} replacementData
   * @internal
   */
  _applyChangesToDocuments(changes, documents, replacementData) {
    for (const d of documents) {
      const overrides = {};
      let qualifierDataComputed = false;
      let qualifierData = {};
      for (const c of changes) {
        let shouldApply = c.qualifier === "1";
        if (!shouldApply) {
          if (!qualifierDataComputed) {
            qualifierData = d.system.getLocalRollData();
            qualifierDataComputed = true;
          }
          shouldApply = Boolean(BaseRoll.minValue(c.qualifier, qualifierData));
        }
        if (shouldApply) {
          const result = ActiveEffect.applyChange(d, c, { replacementData });
          if (foundry.utils.isPlainObject(result)) { Object.assign(overrides, result); }
        }
      }
      d.overrides ??= {};
      foundry.utils.mergeObject(d.overrides, foundry.utils.expandObject(overrides));
    }
  }

  /**
   * Generate an operation for creating staged items.
   * @returns {Promise<Partial<DatabaseCreateOperation>|null>}
   */
  async _getStagedCreateOperation() {
    if (!this._stagedItemCreations || !this._stagedItemCreations.size) { return null; }
    const items = await Promise.all(this._stagedItemCreations.map(uuid => fromKey(uuid)));
    const data = items.map(i => game.items.fromCompendium(i, { clearSort: true, keepId: true }));
    return { action: "create", data, documentName: "Item", pack: this.pack, parent: this };
  }

  /**
   * Generate an operation for deleting staged items.
   * @returns {Promise<Partial<DatabaseDeleteOperation>|null>}
   */
  async _getStagedDeleteOperation() {
    if (!this._stagedItemDeletions || !this._stagedItemDeletions.size) { return null; }
    const ids = Array.from(this._stagedItemDeletions);
    return { action: "delete", documentName: "Item", ids, pack: this.pack, parent: this };
  }

  /**
   * Generate an array of staged operations. This also resets any operations so they're no longer staged. The operation
   * returned by this must be immediately used or dismissed.
   * @returns {Promise<DatabaseWriteOperation[]>}
   */
  async _getStagedOperations() {
    const operations = (await Promise.all([this._getStagedCreateOperation(), this._getStagedDeleteOperation()])).filter(
      Boolean,
    );
    this._resetStagedOperations();
    return operations;
  }

  /**
   * Clear and initialize all staged operations.
   */
  _resetStagedOperations() {
    this._stagedItemCreations = new Set();
    this._stagedItemDeletions = new Set();
  }

  /** @inheritDoc */
  applyActiveEffects(phase) {
    const apply = !this._completedActiveEffectPhases.has(phase);
    if (TERIOCK.config.change.phase[phase]?.applyToChildren && apply) {
      this._applyActiveEffectsToChildren(phase);
      this._completedActiveEffectPhases.add(phase);
    } else {
      super.applyActiveEffects(phase);
    }
    if (TERIOCK.config.change.phase[phase]?.applyToItems && apply) { this._applyActiveEffectsToItems(phase); }
  }

  /**
   * Add multiple status effects to the actor.
   * @param {string[]} statusIds
   * @returns {Promise<void>}
   */
  async applyStatusEffects(statusIds) {
    const effects = await Promise.all(statusIds.map(async id => ActiveEffect.fromStatusEffect(id)));
    await this.createEmbeddedDocuments("ActiveEffect", effects, { keepId: true });
  }

  /** @inheritDoc */
  async getEffectiveChildren() {
    return [...(await super.getEffectiveChildren()), ...game.teriock.basicAbilities];
  }

  /** @inheritDoc */
  async getTokenDocument(data = {}, options = {}) {
    if (game.canvas.scene.grid.type === 0) { data.shape ??= 0; }
    return super.getTokenDocument(data, options);
  }

  /** @inheritDoc */
  async hookCall(trigger, options = {}) {
    const out = await super.hookCall(trigger, options);
    BaseExpiration.massExpire([this], TriggerExpiration.TYPE, { trigger }, false);
    return out;
  }

  /** @inheritDoc */
  makeVisibleChildrenArray() {
    return this.modifiableChildren.filter(c => !c.metadata.revealable || c.system.revealed || game.user.isGM);
  }

  /** @inheritDoc */
  prepareEmbeddedDocuments() {
    super.prepareEmbeddedDocuments();
    this.system.prepareChildAutomations();
    this.prepareChangeData();
    this.applyActiveEffects("setup");
    this.applyActiveEffects(TERIOCK.config.change.defaultPhase);
    this.applyActiveEffects("children");
  }

  /** @inheritDoc */
  prepareSpecialData() {
    super.prepareSpecialData();
    this.applyActiveEffects("special");
  }

  /**
   * Remove multiple status effects from the actor.
   * @param {string[]} statusIds
   * @returns {Promise<void>}
   */
  async removeStatusEffects(statusIds) {
    const candidates = statusIds.map(id => CONFIG.statusEffects[id]).filter(Boolean);
    const toRemove = candidates.filter(e => this.effects.get(e?._id)).map(e => e?._id);
    await this.deleteEmbeddedDocuments("ActiveEffect", toRemove);
  }

  /** @inheritDoc */
  resetChildMaps() {
    super.resetChildMaps();
    delete this._validEffects;
    delete this._modifiableChildren;
  }

  /**
   * Use a specified document.
   * @param {string} lookup - The identifier or name of the document to use. Identifiers are preferred.
   * @param {Teriock.Execution.DocumentExecutionOptions & { type?: Teriock.Documents.ChildType }} [options] - Options
   * for finding and using the document.
   * @return {Promise<void>}
   */
  async useDocument(lookup, options = {}) {
    const doc = await findBestDocument(lookup, this);
    if (doc) { await doc.use(Object.assign(options, { actor: this })); }
    else {
      ui.notifications.warn("TERIOCK.SYSTEMS.Macro.EXECUTION.noDocument", {
        format: {
          actor: this.name,
          name: lookup,
          type: TERIOCK.config.document[options.type || "document"].label.toLowerCase(),
        },
        localize: true,
      });
    }
  }
}
