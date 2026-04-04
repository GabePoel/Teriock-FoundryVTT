import { characterOptions } from "../../constants/options/character-options.mjs";
import { documentTypes } from "../../constants/system/_module.mjs";
import { resolveDocument } from "../../helpers/resolve.mjs";
import { lookupDocument, mix } from "../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

const { Actor } = foundry.documents;

//noinspection JSClosureCompilerSyntax
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
export default class TeriockActor extends mix(
  Actor,
  mixins.BaseDocumentMixin,
  mixins.CommonDocumentMixin,
  mixins.ParentDocumentMixin,
  mixins.RetrievalDocumentMixin,
) {
  /** @inheritDoc */
  static get documentMetadata() {
    return Object.assign(super.documentMetadata, {
      types: Object.keys(documentTypes.actors),
    });
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
   * @returns {Teriock.Config.SizeConfig}
   */
  static sizeConfig(value) {
    const minCategoryMaxSize = Math.min(
      ...characterOptions.sizes.map((d) => d.max).filter((m) => m >= value),
    );
    return foundry.utils.deepClone(
      characterOptions.sizes.find((d) => d.max === minCategoryMaxSize),
    );
  }

  /** @type Set<UUID<TeriockItem>> */
  _stagedItemCreations;

  /** @type Set<ID<TeriockItem>> */
  _stagedItemDeletions;

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
    selected = game.users.active.find(
      (u) => u.character === this && this.canUserModify(u, "update"),
    );

    // See if any players have control over the actor
    selected ??= game.users.active.find(
      (u) => !u.isActiveGM && this.canUserModify(u, "update"),
    );

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
    return (
      this.system.hp.value < this.system.hp.max || this.statuses.has("hacked")
    );
  }

  /**
   * Is this actor drained?
   * @returns {boolean}
   */
  get isDrained() {
    return this.system.mp.value < this.system.mp.max;
  }

  /**
   * @inheritDoc
   * @returns {AnyActiveEffect[]}
   */
  get validEffects() {
    return Array.from(this.allApplicableEffects());
  }

  /** @inheritDoc */
  get visibleChildren() {
    return [...this.validEffects, ...this.items.contents]
      .filter((c) => !c.isEphemeral)
      .filter(
        (c) => !c.metadata.revealable || c.system.revealed || game.user.isGM,
      );
  }

  /**
   * Helper method to add a virtual status.
   * @param {Teriock.Keys.Condition} condition
   * @param {string} reason
   * @param {object} [options]
   * @param {boolean} [options.localize]
   */
  _addVirtualStatus(condition, reason, options = {}) {
    let { localize = true } = options;
    if (!reason) reason = TERIOCK.reference.conditions[condition];
    this.system.conditionInformation[condition]?.reasons?.add(
      localize ? game.i18n.localize(reason) : reason,
    );
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
    for (const condition of conditions) {
      this._addVirtualStatus(condition, reason, options);
    }
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

    // TODO: Refine token update process in V14
    const tokenUpdates =
      foundry.utils.getProperty(changes, "prototypeToken") || {};
    if (foundry.utils.hasProperty(changes, "system.size.raw")) {
      const tokenSize = this.constructor.sizeConfig(changes.size.raw).length;
      if (!foundry.utils.hasProperty(changes, "prototypeToken.width")) {
        tokenUpdates["prototypeToken.width"] = tokenSize;
        tokenUpdates["prototypeToken.height"] = tokenSize;
      }
      for (const token of this.getDependentTokens()) {
        if (token.parent?.grid?.type === 0) {
          await token.resize({
            width: tokenSize,
            height: tokenSize,
          });
        }
      }
    }
    if (Object.keys(tokenUpdates).length > 0) {
      for (const token of this.getDependentTokens()) {
        if (token.id) {
          await token.update(tokenUpdates);
        }
      }
    }
  }

  /**
   * Create all the staged items.
   * @returns {Promise<AnyItem[]>}
   */
  async _processStagedItemCreations() {
    if (!this._stagedItemCreations) return [];
    const items = await Promise.all(
      this._stagedItemCreations.map((uuid) => fromUuid(uuid)),
    );
    const data = items.map((i) =>
      game.items.fromCompendium(i, { keepId: true, clearSort: true }),
    );
    return this.createChildDocuments("Item", Array.from(data));
  }

  /**
   * Delete all staged items.
   * @returns {Promise<CommonDocument[]>}
   */
  async _processStagedItemDeletions() {
    if (!this._stagedItemDeletions) return [];
    return this.deleteChildDocuments(
      "Item",
      Array.from(this._stagedItemDeletions),
    );
  }

  /**
   * All abilities, including virtual ones.
   * @returns {Promise<TeriockAbility[]>}
   */
  async allAbilities() {
    const basicAbilitiesItem = await resolveDocument(
      game.teriock.packs.essentials.index.getName("Basic Abilities"),
    );
    return [...this.abilities, ...(basicAbilitiesItem?.abilities || [])];
  }

  /**
   * Add multiple status effects to the actor.
   * @param {string[]} statusIds
   * @returns {Promise<void>}
   */
  async applyStatusEffects(statusIds) {
    const effects = await Promise.all(
      statusIds.map(async (id) => ActiveEffect.fromStatusEffect(id)),
    );
    await this.createEmbeddedDocuments("ActiveEffect", effects, {
      keepId: true,
    });
  }

  /**
   * Prepare condition information now that all virtual statuses have been applied.
   */
  cleanConditionInformation() {
    if (
      this.system.conditionInformation.hacked.reasons.has(
        game.i18n.localize("TERIOCK.STATUSES.Hacks.armHack2"),
      )
    ) {
      this.system.conditionInformation.hacked.reasons.delete(
        game.i18n.localize("TERIOCK.STATUSES.Hacks.armHack1"),
      );
    }
    if (
      this.system.conditionInformation.hacked.reasons.has(
        game.i18n.localize("TERIOCK.STATUSES.Hacks.legHack2"),
      )
    ) {
      this.system.conditionInformation.hacked.reasons.delete(
        game.i18n.localize("TERIOCK.STATUSES.Hacks.legHack1"),
      );
    }
    for (const info of Object.values(this.system.conditionInformation)) {
      if (info.reasons.size > 0) info.locked = true;
    }
  }

  /**
   * Get a document if this actor has it.
   * @param {string} lookup - An identifier or name. Identifiers are preferred.
   * @param {Teriock.Documents.ChildType} [type] - The type of document.
   * @return {Promise<AnyChildDocument|null>}
   */
  async getDocument(lookup, type) {
    let candidates = this.visibleChildren.filter((c) => c.type !== "ability");
    const abilities = await this.allAbilities();
    candidates.push(...abilities);
    if (type) candidates = candidates.filter((c) => c.type === type);
    return lookupDocument(candidates, lookup) || null;
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
  prepareVirtualEffects() {
    for (const e of this.validEffects) {
      for (const s of e.statuses) {
        if (!e.id.startsWith(s)) {
          this.system.conditionInformation[s]?.reasons.add(e.name);
        }
      }
    }
    this.system.prepareVirtualEffects();
    this.prepareVirtualWounds();
    this.cleanConditionInformation();
  }

  /**
   * Add statuses and explanations for being wounded.
   */
  prepareVirtualWounds() {
    if (!this.getSetting("automaticallyWound")) return;
    // Check what states are triggered in normal circumstances
    const hpUncn = this.system.hp.value < 1;
    const hpCrit =
      this.system.hp.value ===
      (this.system.hp.min < 0 ? this.system.hp.min + 1 : 0);
    const hpDead = this.system.hp.value === this.system.hp.min;
    const mpUncn = this.system.mp.value < 1;
    const mpCrit =
      this.system.mp.value ===
      (this.system.mp.min < 0 ? this.system.mp.min + 1 : 0);
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
    if (hpDead && !protDead && !protDown) {
      this._addVirtualStatuses(
        ["dead", "down"],
        "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.negativeHalfMaxHp",
      );
    }
    if (mpDead && !protDead && !protDown) {
      this._addVirtualStatuses(
        ["dead", "down"],
        "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.negativeHalfMaxMp",
      );
    }
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
      if (this.system.hp.value === 0) {
        this._addVirtualStatuses(
          ["unconscious", "down"],
          "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.zeroHp",
        );
      } else {
        this._addVirtualStatuses(
          ["unconscious", "down"],
          "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.negativeHp",
        );
      }
    }
    if (mpUncn && !protUncn && !autoCrit && !autoDead && !protDown) {
      if (this.system.mp.value === 0) {
        this._addVirtualStatuses(
          ["unconscious", "down"],
          "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.zeroMp",
        );
      } else {
        this._addVirtualStatuses(
          ["unconscious", "down"],
          "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.negativeMp",
        );
      }
    }

    if (this.statuses.has("dead")) {
      this.statuses.delete("unconscious");
      this.statuses.delete("criticallyWounded");
    }
    if (this.statuses.has("criticallyWounded")) {
      this.statuses.delete("unconscious");
    }
  }

  /**
   * Remove multiple status effects from the actor.
   * @param {string[]} statusIds
   * @returns {Promise<void>}
   */
  async removeStatusEffects(statusIds) {
    const candidates = CONFIG.statusEffects.filter((e) =>
      statusIds.includes(e.id),
    );
    const toRemove = candidates
      .filter((e) => this.effects.get(e?._id))
      .map((e) => e?._id);
    await this.deleteEmbeddedDocuments("ActiveEffect", toRemove);
  }

  /**
   * Use a specified document.
   * @param {string} lookup - The identifier or ame of the document to use. Identifiers are preferred.
   * @param {Teriock.Execution.DocumentExecutionOptions & { type?: Teriock.Documents.ChildType }} [options] - Options
   * for finding and using the document.
   * @return {Promise<void>}
   */
  async useDocument(lookup, options = {}) {
    const doc = await this.getDocument(lookup, options.type);
    if (doc) await doc.use(Object.assign(options, { actor: this }));
    else {
      ui.notifications.warn("TERIOCK.SYSTEMS.Macro.EXECUTION.noDocument", {
        format: {
          actor: this.name,
          type: TERIOCK.options.document[
            options.type || "document"
          ].name.toLowerCase(),
          name: lookup,
        },
        localize: true,
      });
    }
  }
}
