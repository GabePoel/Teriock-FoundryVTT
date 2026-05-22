import { config } from "../../constants/_module.mjs";
import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { resolveDocument } from "../../helpers/resolve.mjs";
import { findBestDocument, fromKey } from "../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

const { Actor } = foundry.documents;

/**
 * The Teriock Actor implementation.
 * @implements {Teriock.Documents.ActorInterface}
 * @implements {Teriock.Data.ActorPropagator}
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
    mixins.BaseDocumentMixin,
    mixins.CommonDocumentMixin,
    mixins.ParentDocumentMixin,
    mixins.RetrievalDocumentMixin,
  )
{
  /** @inheritDoc */
  static get documentMetadata() {
    return Object.assign(super.documentMetadata, { types: Object.keys(CONFIG.Actor.dataModels) });
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
  static defaultWeight(size, amount = "typical") {
    if (amount === "min") size -= 0.5;
    if (amount === "max") size += 0.5;
    return Math.max(0.001, Math.pow(3 + size, 3));
  }

  /**
   * Get the definition of several fields for a given numerical size value.
   *
   * Relevant wiki pages:
   * - [Size](https://wiki.teriock.com/index.php/Core:Size)
   *
   * @param {number} value
   * @returns {Teriock.Config.SizeEntry}
   */
  static sizeConfig(value) {
    const minCategoryMaxSize = Math.min(...config.character.sizes.map(d => d.max).filter(m => m >= value));
    return foundry.utils.deepClone(config.character.sizes.find(d => d.max === minCategoryMaxSize));
  }

  /** @type {Set<UUID<TeriockItem>|TypedIdentifier>} */
  _stagedItemCreations = new Set();

  /** @type {Set<ID<TeriockItem>>} */
  _stagedItemDeletions = new Set();

  /**
   * Is this actor active?
   * @returns {boolean}
   */
  get active() {
    return true;
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
    if (this.token) return this.token.object;
    return this.getActiveTokens()[0] || null;
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

  /**
   * Is this actor damaged?
   * @returns {boolean}
   */
  get isDamaged() {
    return this.system.hp.value < this.system.hp.max || this.statuses.has("hacked");
  }

  /**
   * Is this actor drained?
   * @returns {boolean}
   */
  get isDrained() {
    return this.system.mp.value < this.system.mp.max;
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
    return [...this.validEffects, ...this.items.contents].filter(c => !c.isEphemeral && !c.isReference);
  }

  /**
   * @inheritDoc
   * @returns {AnyActiveEffect[]}
   */
  get validEffects() {
    return Array.from(this.allApplicableEffects());
  }

  /**
   * Helper method to add a virtual status.
   * @param {Teriock.Keys.Condition} condition
   * @param {string} reason
   * @param {object} [options]
   * @param {boolean} [options.localize]
   */
  _addVirtualStatus(condition, reason, options = {}) {
    const { localize = true } = options;
    if (!reason) reason = TERIOCK.reference.conditions[condition];
    this.system.conditionInformation[condition]?.reasons?.add(localize ? _loc(reason) : reason);
    this.statuses.add(condition);
  }

  /**
   * Helper method to add multiple virtual statuses with the same reason.
   * @param {Teriock.Keys.Condition[]} conditions
   * @param {string} reason
   * @param {object} [options]
   * @param {boolean} [options.localize]
   */
  _addVirtualStatuses(conditions, reason, options = {}) {
    for (const condition of conditions) this._addVirtualStatus(condition, reason, options);
  }

  /**
   * Apply any transformations to child data which are caused by ActiveEffects.
   * @param {Teriock.Changes.Phase} phase
   * @internal
   */
  _applyActiveEffectsToChildren(phase) {
    if (!game.teriock.getSetting("nonHierarchicalChanges") || !this.getSetting("automation.nonHierarchicalChanges"))
      return;
    /** @type {Record<string, Teriock.Changes.QualifiedChangeData[]>} */
    const changeMap = { ability: [], armament: [] };
    for (const effect of this.allApplicableEffects()) {
      if (!effect.active) continue;
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
    for (const c of Object.values(changeMap)) c.sort((a, b) => a?.priority - b?.priority);
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
    for (const item of this.items) item.applyActiveEffects(phase);
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
          shouldApply = !!BaseRoll.minValue(c.qualifier, qualifierData);
        }
        if (shouldApply) {
          const result = ActiveEffect.applyChange(d, c, { replacementData });
          if (foundry.utils.isPlainObject(result)) Object.assign(overrides, result);
        }
      }
      d.overrides ??= {};
      foundry.utils.mergeObject(d.overrides, foundry.utils.expandObject(overrides));
    }
  }

  /**
   * Apply all competence automations of a certain value to this actor's children.
   * @param {Teriock.System.CompetenceLevel} value
   */
  _applyCompetenceAutomations(value) {
    const autos = this.validEffects.filter(e => e.active).flatMap(e =>
      e.system.activeAutomations.filter(a => a?.type === "changeCompetence" && a?.competence.value === value)
    );
    const identifiers = new Set(autos.map(a => a.identifier));
    for (const c of this.modifiableChildren)
      if (identifiers.has(c.typedIdentifier) && c.system.competence.raw < value) c.system.competence.raw = value;
  }

  /**
   * Apply all suppress automations that force certain children of this document to be suppressed.
   */
  _applySuppressAutomations() {
    const autos = this.validEffects.filter(e => e.active).flatMap(e =>
      e.system.activeAutomations.filter(a => a?.type === "suppress")
    );
    const identifiers = new Set(autos.map(a => a.identifier));
    for (const c of this.modifiableChildren) if (identifiers.has(c.typedIdentifier)) c.system.forceSuppressed = true;
  }

  /**
   * Generate an operation for creating staged items.
   * @returns {Promise<Partial<DatabaseCreateOperation>|null>}
   */
  async _getStagedCreateOperation() {
    if (!this._stagedItemCreations || !this._stagedItemCreations.size) return null;
    const items = await Promise.all(this._stagedItemCreations.map(uuid => fromKey(uuid)));
    const data = items.map(i => game.items.fromCompendium(i, { clearSort: true, keepId: true }));
    return { action: "create", data, documentName: "Item", pack: this.pack, parent: this };
  }

  /**
   * Generate an operation for deleting staged items.
   * @returns {Promise<Partial<DatabaseDeleteOperation>|null>}
   */
  async _getStagedDeleteOperation() {
    if (!this._stagedItemDeletions || !this._stagedItemDeletions.size) return null;
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
   * @inheritDoc
   * @param {ActorData} data
   * @param {object} options
   * @param {TeriockUser} user
   * @returns {Promise<boolean|void>}
   */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) return false;

    this.updateSource(
      foundry.utils.mergeObject({
        prototypeToken: {
          height: this.system.size.length,
          sight: { enabled: true, range: 0 },
          width: this.system.size.length,
        },
      }),
      data,
    );
  }

  /**
   * @inheritDoc
   * @param {object} changes
   * @param {object} options
   * @param {TeriockUser} user
   * @returns {Promise<boolean|void>}
   */
  async _preUpdate(changes, options, user) {
    const yes = await super._preUpdate(changes, options, user);
    if (yes === false) return false;

    const tokenUpdates = foundry.utils.getProperty(changes, "prototypeToken") || {};
    if (foundry.utils.hasProperty(changes, "system.size.raw")) {
      const tokenSize = this.constructor.sizeConfig(changes.size.raw).length;
      if (!foundry.utils.hasProperty(changes, "prototypeToken.width")) {
        tokenUpdates["prototypeToken.width"] = tokenSize;
        tokenUpdates["prototypeToken.height"] = tokenSize;
      }
      for (const token of this.getDependentTokens())
        if (token.parent?.grid?.type === 0) await token.resize({ height: tokenSize, width: tokenSize });
    }
    if (Object.keys(tokenUpdates).length > 0) {
      await Promise.all(
        this.getDependentTokens().filter(t => t.id).map(t => t.update(foundry.utils.deepClone(tokenUpdates))),
      );
    }
  }

  /**
   * Clear and initialize all staged operations.
   */
  _resetStagedOperations() {
    this._stagedItemCreations = new Set();
    this._stagedItemDeletions = new Set();
  }

  /**
   * All abilities, including virtual ones.
   * @returns {Promise<TeriockAbility[]>}
   */
  async allAbilities() {
    const basicAbilitiesItem = await resolveDocument(game.teriock.packs.essentials.index.getName("Basic Abilities"));
    return [...this.abilities, ...(basicAbilitiesItem?.abilities || [])];
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
    if (TERIOCK.config.change.phase[phase]?.applyToItems && apply) this._applyActiveEffectsToItems(phase);
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

  /**
   * Prepare condition information now that all virtual statuses have been applied.
   */
  cleanConditionInformation() {
    for (const part of ["arm", "leg"]) {
      const str = `TERIOCK.STATUSES.Hacks.${part}Hack`;
      if (this.system.conditionInformation.hacked.reasons.has(_loc(`${str}2`)))
        this.system.conditionInformation.hacked.reasons.delete(_loc(`${str}1`));
    }
    for (const info of Object.values(this.system.conditionInformation)) if (info.reasons.size > 0) info.locked = true;
  }

  /** @inheritDoc */
  async getEffectiveChildren() {
    const children = (await super.getEffectiveChildren()).filter(c => c.type !== "ability");
    const abilities = await this.allAbilities();
    children.push(...abilities);
    return children;
  }

  /** @inheritDoc */
  async getTokenDocument(data = {}, options = {}) {
    if (game.canvas.scene.grid.type === 0) data.shape ??= 0;
    return super.getTokenDocument(data, options);
  }

  /** @inheritDoc */
  makeVisibleChildrenArray() {
    return this.modifiableChildren.filter(c => !c.metadata.revealable || c.system.revealed || game.user.isGM);
  }

  /**
   * Performs post-update operations for the actor.
   * @returns {Promise<void>}
   */
  async postUpdate() {
    await this.system.postUpdate();
  }

  /** @inheritDoc */
  prepareData() {
    super.prepareData();
    this.prepareSpecialData();
    this.prepareVirtualEffects();
  }

  /** @inheritDoc */
  prepareEmbeddedDocuments() {
    super.prepareEmbeddedDocuments();
    this._applySuppressAutomations();
    this._applyCompetenceAutomations(1);
    this._applyCompetenceAutomations(2);
    this.prepareChangeData();
    this.applyActiveEffects(TERIOCK.config.change.defaultPhase);
    this.applyActiveEffects("children");
  }

  /** @inheritDoc */
  prepareVirtualEffects() {
    for (const e of this.validEffects)
      for (const s of e.statuses) if (!e.id.startsWith(s)) this.system.conditionInformation[s]?.reasons.add(e.name);
    this.prepareVirtualWounds();
    this.system.prepareVirtualEffects();
    this.cleanConditionInformation();
  }

  /**
   * Add statuses and explanations for being wounded.
   */
  prepareVirtualWounds() {
    if (!this.getSetting("automation.wound")) return;
    // Check what states are triggered in normal circumstances
    const hpUncn = this.system.hp.value < 1;
    const hpCrit = this.system.hp.value === (this.system.hp.min < 0 ? this.system.hp.min + 1 : 0);
    const hpDead = this.system.hp.value === this.system.hp.min;
    const mpUncn = this.system.mp.value < 1;
    const mpCrit = this.system.mp.value === (this.system.mp.min < 0 ? this.system.mp.min + 1 : 0);
    const mpDead = this.system.mp.value === this.system.mp.min;

    // Merge HP and MP
    const statDead = hpDead || mpDead;
    const statCrit = hpCrit || mpCrit;

    // Check what states are at least partially passively protected against
    const protUncn = this.system.isProtected("statuses", "unconscious");
    const protCrit = this.system.isProtected("statuses", "criticallyWounded");
    const protDead = this.system.isProtected("statuses", "dead");
    const protDown = this.system.isProtected("statuses", "down");

    // What wounds that supersede other wounds would apply automatically
    const autoDead = statDead && !protDead && !protDown;
    const autoCrit = statCrit && !protCrit && !protDown && !autoDead;

    // Factoring in protections and overriding states, which states would automatically trigger
    if (hpDead && !protDead && !protDown)
      this._addVirtualStatuses(["dead", "down"], "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.negativeHalfMaxHp");
    if (mpDead && !protDead && !protDown)
      this._addVirtualStatuses(["dead", "down"], "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.negativeHalfMaxMp");
    if (hpCrit && !protCrit && !protDown && !autoDead) {
      this._addVirtualStatuses(
        ["criticallyWounded", "down"],
        "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.criticallyNegativeHp",
      );
    }
    if (mpCrit && !protCrit && !protDown && !autoDead) {
      this._addVirtualStatuses(
        ["criticallyWounded", "down"],
        "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.criticallyNegativeMp",
      );
    }
    if (hpUncn && !protUncn && !autoCrit && !autoDead && !protDown) {
      if (this.system.hp.value === 0)
        this._addVirtualStatuses(["unconscious", "down"], "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.zeroHp");
      else this._addVirtualStatuses(["unconscious", "down"], "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.negativeHp");
    }
    if (mpUncn && !protUncn && !autoCrit && !autoDead && !protDown) {
      if (this.system.mp.value === 0)
        this._addVirtualStatuses(["unconscious", "down"], "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.zeroMp");
      else this._addVirtualStatuses(["unconscious", "down"], "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.negativeMp");
    }

    if (this.statuses.has("dead")) {
      this.statuses.delete("unconscious");
      this.statuses.delete("criticallyWounded");
    }
    if (this.statuses.has("criticallyWounded")) this.statuses.delete("unconscious");
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

  /**
   * Use a specified document.
   * @param {string} lookup - The identifier or name of the document to use. Identifiers are preferred.
   * @param {Teriock.Execution.DocumentExecutionOptions & { type?: Teriock.Documents.ChildType }} [options] - Options
   * for finding and using the document.
   * @return {Promise<void>}
   */
  async useDocument(lookup, options = {}) {
    const doc = await findBestDocument(lookup, this);
    if (doc) await doc.use(Object.assign(options, { actor: this }));
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
