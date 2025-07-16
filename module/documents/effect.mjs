import { BaseTeriockEffect } from "./_base.mjs";

/**
 * @property {TeriockBaseEffectData} system
 * @property {TeriockBaseEffectSheet} sheet
 * @property {TeriockActor|TeriockItem} parent
 */
export default class TeriockEffect extends BaseTeriockEffect {
  /**
   * Checks if the effect is suppressed, combining system suppression with parent suppression.

   * @returns {boolean} True if the effect is suppressed, false otherwise.
   * @override
   */
  get isSuppressed() {
    let suppressed = super.isSuppressed;
    return this.system.suppressed || suppressed;
  }

  /**
   * Returns the actor that this effect is associated with, if there is one.
   *
   * @returns {TeriockActor}
   */
  get actor() {
    if (this.parent.documentName === "Actor") {
      return this.parent;
    } else {
      return this.parent.actor;
    }
  }

  /**
   * Gets the effect that provides this effect, if there is one.
   * Synchronous by default. Asynchronous fallback for compendiums.
   *
   * @returns {TeriockEffect|null|Promise<TeriockEffect|null>}
   */
  get sup() {
    if (this.supId) {
      const effect = this.supSync;
      if (effect) {
        return effect;
      }
    }
    if (this.system.supUuid) {
      try {
        return foundry.utils.fromUuidSync(this.system.supUuid);
      } catch (e) {
        // Fallback to async if sync fails
        return foundry.utils.fromUuid(this.system.supUuid);
      }
    }
    return null;
  }

  /**
   * Gets the effect that provides this effect, if there is one.
   * Always synchronous.
   *
   * @returns {TeriockEffect|null}
   */
  get supSync() {
    if (this.supId) {
      return /** @type {TeriockEffect} */ this.parent.getEmbeddedDocument("ActiveEffect", this.supId);
    }
    return null;
  }

  /**
   * Safely gets the ID of the effect that provides this effect, if there is one.
   *
   * @returns {string|null}
   */
  get supId() {
    if (this.system.supId && this.parent.effects.has(this.system.supId)) {
      return this.system.supId;
    }
    return null;
  }

  /**
   * Gets all effects that this effect is a sub-effect of.
   * Synchronous by default. Asynchronous fallback for compendiums.
   *
   * @returns {TeriockEffect[]|Promise<TeriockEffect[]>} Array of super-effects, ordered from immediate sup to top
   *   level.
   */
  get allSups() {
    const supEffects = [];
    let supEffect = this.sup;
    if (supEffect) {
      supEffects.push(supEffect);
      supEffects.push(...supEffect.allSups);
    }
    return supEffects;
  }

  /**
   * Gets all effects that this effect is a sub-effect of.
   * Always synchronous.
   *
   * @returns {TeriockEffect[]} Array of super-effects, ordered from immediate sup to top level.
   */
  get allSupsSync() {
    const supEffects = [];
    let supEffect = this.supSync;
    if (supEffect) {
      supEffects.push(supEffect);
      supEffects.push(...supEffect.allSupsSync);
    }
    return supEffects;
  }

  /**
   * Gets all sub-effects that are derived from this effect.
   *
   * @returns {TeriockEffect[]|Promise<TeriockEffect>} Array of sub-effects.
   */
  get subs() {
    const subEffects = [];
    if (this.subIds?.length > 0) {
      for (const uuid of this.system.subUuids) {
        try {
          const subEffect = foundry.utils.fromUuidSync(uuid);
          subEffects.push(subEffect);
        } catch (e) {
          // Fallback to async if sync fails
          const subEffect = foundry.utils.fromUuid(uuid);
          subEffects.push(subEffect);
        }
      }
    }
    return subEffects;
  }

  /**
   * Safely gets the IDS of all sub-effects that are derived from this effect.
   *
   * @returns {string[]}
   */
  get subIds() {
    if (this.system.subIds?.length > 0) {
      return /** @type {string[]} */ this.system.subIds.filter((id) => this.parent.effects.has(id));
    }
    return [];
  }

  /**
   * Gets all sub-effects that are derived from this effect.
   * Always asynchronous.
   *
   * @returns {function(): Promise<TeriockEffect[]>} Array of sub-effects.
   */
  get subsAsync() {
    return async () => {
      const subEffects = [];
      if (this.system.subUuids?.length > 0) {
        for (const uuid of this.system.subUuids) {
          const subEffect = await foundry.utils.fromUuid(uuid);
          if (subEffect) {
            subEffects.push(subEffect);
          }
        }
      }
      return subEffects;
    };
  }

  /**
   * Gets all sub-effects descendant from this effect recursively.
   * Synchronous by default. Asynchronous fallback for compendiums.
   *
   * @returns {TeriockEffect[]} Array of all descendant effects.
   */
  get allSubs() {
    const allSubEffects = [];
    const subEffects = this.subs;
    for (const subEffect of subEffects) {
      allSubEffects.push(subEffect);
      allSubEffects.push(...subEffect.allSubs);
    }
    return allSubEffects;
  }

  /**
   * Gets all sub-effect descendents from this effect recursively.
   * Always asynchronous.
   *
   * @returns {function(): Promise<TeriockEffect[]>}
   */
  get allSubsAsync() {
    return async () => {
      /** @type {TeriockEffect[]} */
      const allSubEffects = [];
      const subEffects = await this.subsAsync();
      for (const subEffect of subEffects) {
        allSubEffects.push(subEffect);
        const subSubEffects = await subEffect.allSubsAsync();
        allSubEffects.push(...subSubEffects);
      }
      return allSubEffects;
    };
  }

  /**
   * Gets the document that most directly applies this effect. If it's an effect, returns that.
   * Otherwise, gets what Foundry considers to be the parent.
   *
   * @returns {TeriockActor|TeriockEffect|TeriockItem} The source document that applies this effect.
   */
  get source() {
    let source = this.sup;
    if (!source) {
      source = this.parent;
    }
    return source;
  }

  /**
   * Checks if this effect is a reference effect by examining its sups for non-passive maneuvers.
   *
   * @returns {boolean} True if this is a reference effect, false otherwise.
   */
  get isReference() {
    const sups = this.allSupsSync;
    for (const sup of sups) {
      if (sup.system.maneuver !== "passive") {
        return true;
      }
    }
    return false;
  }

  /**
   * Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only
   * occur for the client which requested the operation.
   *
   * This batch-wise workflow occurs after individual {@link _preCreate} workflows and provides a final pre-flight check
   * before a database operation occurs.
   *
   * Modifications to pending documents must mutate the documents array or alter individual document instances using
   * {@link updateSource}.
   *
   * @param {TeriockEffect[]} documents           Pending document instances to be created
   * @param {DatabaseCreateOperation} operation   Parameters of the database creation operation
   * @param {BaseUser} user                       The User requesting the creation operation
   * @returns {Promise<boolean|void>}             Return false to cancel the creation operation entirely
   * @protected
   */
  static async _preCreateOperation(documents, operation, user) {
    await super._preCreateOperation(documents, operation, user);
    /** @type {TeriockEffect[]} */
    const toCreate = [];
    for (const supEffect of documents) {
      const newSupId = foundry.utils.randomID();
      supEffect.updateSource({ _id: newSupId });
      if (["ability", "effect"].includes(supEffect.type)) {
        /** @type {string[]} */
        const newSubIds = [];
        if (supEffect.subIds.length > 0) {
          const supRoot = /** @type {TeriockActor|TeriockItem} */ await foundry.utils.fromUuid(
            supEffect.system?.rootUuid,
          );
          for (const id of supEffect.subIds) {
            /** @type {TeriockEffect} */
            const refSub = supRoot.effects.get(id);
            const newSubId = foundry.utils.randomID();
            const newSub = await refSub.clone({
              "system.rootUuid": operation.parent.uuid,
              "system.supId": newSupId,
            });
            newSub.updateSource({ _id: newSubId });
            toCreate.push(newSub);
            newSubIds.push(newSubId);
          }
        }
        supEffect.updateSource({
          "system.rootUuid": operation.parent.uuid,
          "system.subIds": newSubIds,
        });
      }
    }
    documents.push(...toCreate);
    operation.keepId = true;
  }

  /**
   * Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only
   * occur for the client which requested the operation.
   *
   * This batch-wise workflow occurs after individual {@link _preDelete} workflows and provides a final pre-flight check
   * before a database operation occurs.
   *
   * Modifications to the requested deletions are performed by mutating the operation object.
   * {@link updateSource}.
   *
   * @param {TeriockEffect[]} documents                Document instances to be deleted
   * @param {DatabaseDeleteOperation} operation   Parameters of the database update operation
   * @param {BaseUser} user                       The User requesting the deletion operation
   * @returns {Promise<boolean|void>}             Return false to cancel the deletion operation entirely
   * @protected
   */
  static async _preDeleteOperation(documents, operation, user) {
    await super._preDeleteOperation(documents, operation, user);
    for (const supEffect of documents) {
      if (["ability", "effect"].includes(supEffect.type)) {
        const subEffects = await supEffect.subsAsync();
        const subIds = subEffects.map((e) => e.id);
        /** @type {TeriockActor|TeriockItem} */
        const parent = operation.parent;
        const realSubIds = subIds.filter((id) => parent.effects.has(id));
        operation.ids.push(...realSubIds);
      }
    }
  }

  /**
   * Prepares derived data for the effect, handling ability-specific logic and attunement changes.
   *
   * @todo Move this logic to {@link TeriockAttunementData} as appropriate.
   * @inheritdoc
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.type === "attunement") {
      this.changes = [
        { key: "system.attunements", mode: 2, value: this.system.target, priority: 10 },
        { key: "system.presence.value", mode: 2, value: this.system.tier, priority: 10 },
      ];
    }
  }

  /**
   * Deletes all sub-effects and clears the sub IDs from this effect.
   *
   * @returns {Promise<void>} Promise that resolves when all subs are deleted.
   */
  async deleteSubs() {
    if (this.subIds > 0) {
      await this.update({
        "system.subIds": [],
      });
      await this.parent?.deleteEmbeddedDocuments("ActiveEffect", this.subIds);
    }
  }

  /**
   * Add a sub-effect to this one.
   *
   * @param {TeriockEffect} sub
   * @returns {Promise<void>}
   */
  async addSub(sub) {
    const validTypes = ["ability", "effect"];
    if (validTypes.includes(this.type) && validTypes.includes(sub.type)) {
      const newSubIds = this.subIds;
      newSubIds.push(sub.id);
      await this.parent.updateEmbeddedDocuments("ActiveEffect", [
        {
          _id: this.id,
          "system.subIds": newSubIds,
        },
        {
          _id: sub.id,
          "system.supId": this.id,
        },
      ]);
    }
  }

  /**
   * Duplicates the effect and updates parent-child relationships.
   *
   * @todo Create `addSub` and `setSup` methods to handle this more generally.
   * @returns {Promise<TeriockEffect>} Promise that resolves to the duplicated effect.
   * @override
   */
  async duplicate() {
    const copy = /** @type {TeriockEffect} */ await super.duplicate();
    const sup = copy.sup;
    if (sup) {
      await sup.addSub(copy);
    }
  }

  /**
   * Disables the effect by setting its `disabled` property to true.
   *
   * @returns {Promise<void>} Promise that resolves when the effect is disabled.
   */
  async disable() {
    await this.update({ disabled: true });
  }

  /**
   * Enables the effect by setting its `disabled` property to false.
   *
   * @returns {Promise<void>} Promise that resolves when the effect is enabled.
   */
  async enable() {
    await this.update({ disabled: false });
  }

  /**
   * Toggles the `disabled` state of the effect.
   * If the effect is currently disabled, it will be enabled, and vice versa.
   *
   * @returns {Promise<void>} Promise that resolves when the disabled state is toggled.
   */
  async toggleDisabled() {
    await this.update({ disabled: !this.disabled });
  }

  /**
   * Forces an update of the effect by toggling the update counter.
   * This is useful for triggering reactive updates in the UI.
   *
   * @returns {Promise<void>} Promise that resolves when the effect is updated.
   */
  async forceUpdate() {
    await this.update({ "system.updateCounter": !this.system.updateCounter });
  }
}
