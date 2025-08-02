import { BaseTeriockEffect } from "./_base.mjs";

/**
 * The Teriock {@link ActiveEffect} implementation.
 *
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
   * Metadata for this effect.
   *
   * @returns {Teriock.EffectMetadata}
   */
  get metadata() {
    return this.system.constructor.metadata;
  }

  /**
   * Gets the effect that provides this effect, if there is one.
   *
   * @returns {TeriockEffect|null}
   */
  get sup() {
    if (this.supId) {
      return /** @type {TeriockEffect} */ this.parent.getEmbeddedDocument(
        "ActiveEffect",
        this.supId,
      );
    }
    return null;
  }

  /**
   * Safely gets the ID of the effect that provides this effect, if there is one.
   *
   * @returns {string|null}
   */
  get supId() {
    if (
      this.metadata?.canSub &&
      this.system.hierarchy.supId &&
      this.parent.effects.has(this.system.hierarchy.supId)
    ) {
      return this.system.hierarchy.supId;
    }
    return null;
  }

  /**
   * Gets all effects that this effect is a sub-effect of.
   *
   * @returns {TeriockEffect[]} Array of super-effects, ordered from immediate sup to top level.
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
   * Gets all sub-effects that are derived from this effect.
   *
   * @returns {TeriockEffect[]}
   */
  get subs() {
    /** @type {TeriockEffect[]} */
    const subEffects = [];
    for (const id of this.subIds) {
      const root = game.teriock.api.utils.fromUuidSync(
        this.system.hierarchy.rootUuid,
      );
      subEffects.push(root.effects.get(id));
    }
    return subEffects;
  }

  /**
   * Safely gets the IDS of all sub-effects that are derived from this effect.
   *
   * @returns {Set<string>}
   */
  get subIds() {
    if (this.metadata.canSub && this.system.hierarchy.subIds.size > 0) {
      const root =
        /** @type {TeriockActor|TeriockItem} */ game.teriock.api.utils.fromUuidSync(
          this.system.hierarchy.rootUuid,
        );
      return this.system.hierarchy.subIds.filter((id) => root.effects.has(id));
    }
    return new Set();
  }

  /**
   * Gets all sub-effects descendant from this effect recursively.
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
   * Checks if this effect is supposed to activate on the use of its parent {@link TeriockItem}.
   *
   * @returns {boolean}
   */
  get isOnUse() {
    return (
      this.parent.documentName === "Item" &&
      this.parent.system.onUse.has(this.id)
    );
  }

  /**
   * Checks if this effect is a reference effect by examining its sups for non-passive maneuvers.
   *
   * @returns {boolean} True if this is a reference effect, false otherwise.
   */
  get isReference() {
    const sups = this.allSups;
    if (this.isOnUse) return true;
    for (const sup of sups) {
      if (sup.system.maneuver !== "passive") {
        return true;
      }
    }
    return false;
  }

  /** @inheritDoc */
  static migrateData(data) {
    if (typeof data?.type === "string" && data.type === "effect") {
      data.type = "consequence";
    }
    return data;
  }

  /**
   * Change the IDs for many client effects consistently.
   *
   * @param {TeriockEffect[]} effects - Client documents.
   * @param {Record<string,string>} idMap - Mapping of old IDs to new IDs.
   * @param {string} rootUuid - UUID for the parent {@link TeriockActor} or {@link TeriockItem} document.
   * @returns {TeriockEffect[]}
   * @private
   */
  static _changeEffectIds(effects, idMap, rootUuid) {
    const oldIds = Object.keys(idMap);
    return effects.map((oldEffect) => {
      const newEffect = /** @type {TeriockEffect} */ oldEffect.clone();
      const updateData = {
        "system.hierarchy.rootUuid": rootUuid,
      };
      if (oldIds.includes(oldEffect.id)) {
        updateData["_id"] = idMap[oldEffect.id];
      }
      if (oldEffect.metadata.canSub) {
        if (oldIds.includes(oldEffect.system.hierarchy.supId)) {
          updateData["system.hierarchy.supId"] =
            idMap[oldEffect.system.hierarchy.supId];
        }
        const newSubIds = new Set();
        for (const oldId of oldEffect.system.hierarchy.subIds) {
          newSubIds.add(idMap[oldId]);
        }
        updateData["system.hierarchy.subIds"] = newSubIds;
      }
      newEffect.updateSource(updateData);
      return newEffect;
    });
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
   * @param {TeriockEffect[]} documents - Pending document instances to be created
   * @param {DatabaseCreateOperation} operation - Parameters of the database creation operation
   * @param {TeriockUser} user - The User requesting the creation operation
   * @returns {Promise<boolean|void>} - Return false to cancel the creation operation entirely
   * @protected
   */
  static async _preCreateOperation(documents, operation, user) {
    await super._preCreateOperation(documents, operation, user);
    /** @type {TeriockEffect[]} */
    const toCreate = [];
    for (const supEffect of documents) {
      const newSupId = foundry.utils.randomID();
      toCreate.push(supEffect);
      if (supEffect?.metadata?.canSub) {
        supEffect.updateSource({ _id: newSupId });
        if (supEffect.subIds.size > 0) {
          const oldSupId = supEffect.subs[0].system.hierarchy.supId;
          const subEffects = supEffect.allSubs;
          const idMap = {};
          for (const id of subEffects.map((sub) => sub.id)) {
            idMap[id] = foundry.utils.randomID();
          }
          idMap[oldSupId] = newSupId;
          const newSubs = this._changeEffectIds(
            subEffects,
            idMap,
            operation.parent.uuid,
          );
          supEffect.updateSource({
            "system.hierarchy.subIds": supEffect.subIds.map(
              (oldId) => idMap[oldId],
            ),
          });
          toCreate.push(...newSubs);
        }
        supEffect.updateSource({
          "system.hierarchy.rootUuid": operation.parent.uuid,
        });
        operation.keepId = true;
      }
    }
    documents.length = 0;
    documents.push(...toCreate);
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
   * @param {TeriockEffect[]} documents - Document instances to be deleted
   * @param {DatabaseDeleteOperation} operation - Parameters of the database update operation
   * @param {TeriockUser} user - The User requesting the deletion operation
   * @returns {Promise<boolean|void>} - Return false to cancel the deletion operation entirely
   * @protected
   */
  static async _preDeleteOperation(documents, operation, user) {
    await super._preDeleteOperation(documents, operation, user);
    for (const supEffect of documents) {
      if (supEffect?.metadata?.canSub) {
        operation.ids.push(...Array.from(supEffect.allSubs.map((e) => e.id)));
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
        {
          key: "system.attunements",
          mode: 2,
          value: this.system.target,
          priority: 10,
        },
        {
          key: "system.presence.value",
          mode: 2,
          value: this.system.tier,
          priority: 10,
        },
      ];
    }
  }

  /**
   * Deletes all sub-effects and clears the sub IDs from this effect.
   *
   * @returns {Promise<void>} Promise that resolves when all subs are deleted.
   */
  async deleteSubs() {
    if (this.subIds.size > 0) {
      await this.parent?.deleteEmbeddedDocuments(
        "ActiveEffect",
        Array.from(this.subIds),
      );
      await this.update({
        "system.hierarchy.subIds": new Set(),
      });
    }
  }

  /**
   * Add a sub-effect to this one.
   *
   * @param {TeriockEffect} sub
   * @returns {Promise<void>}
   */
  async addSub(sub) {
    if (this.metadata.canSub && sub.metadata.canSub) {
      const newSubIds = this.subIds;
      newSubIds.add(sub.id);
      await this.parent.updateEmbeddedDocuments("ActiveEffect", [
        {
          _id: this.id,
          "system.hierarchy.subIds": newSubIds,
        },
        {
          _id: sub.id,
          "system.hierarchy.supId": this.id,
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
