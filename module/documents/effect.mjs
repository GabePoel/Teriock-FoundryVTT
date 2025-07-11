import { BaseTeriockEffect } from "./_base.mjs";

/**
 * @property {TeriockBaseEffectData} system
 * @property {TeriockBaseEffectSheet} sheet
 * @property {TeriockActor|TeriockItem} parent
 */
export default class TeriockEffect extends BaseTeriockEffect {
  /**
   * Checks if the effect is suppressed, combining system suppression with parent suppression.
   * @override
   * @returns {boolean} True if the effect is suppressed, false otherwise.
   */
  get isSuppressed() {
    let suppressed = super.isSuppressed;
    return this.system.suppressed || suppressed;
  }

  /**
   * Returns the actor that this effect is associated with, if there is one.
   * @returns {TeriockActor}
   */
  get actor() {
    if (this.parent?.documentName === "Actor") {
      return this.parent;
    } else {
      return this.parent.actor;
    }
  }

  /**
   * Gets the effect that provides this effect, if there is one.
   * Synchronous by default. Asynchronous fallback for compendiums.
   * @returns {TeriockEffect|null|Promise<TeriockEffect|null>}
   */
  get sup() {
    if (this.system.supId) {
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
   * Gets te effect that provides this effect, if there is one.
   * Always synchronous.
   * @returns {TeriockEffect|null}
   */
  get supSync() {
    if (this.system.supId) {
      return this.parent.getEmbeddedDocument("ActiveEffect", this.system.supId);
    }
    return null;
  }

  /**
   * Gets all effects that this effect is a sub-effect of.
   * Synchronous by default. Asynchronous fallback for compendiums.
   * @returns {TeriockEffect[]|Promise<TeriockEffect[]>} Array of super-effects, ordered from immediate sup to top level.
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
   * @returns {TeriockEffect[]|Promise<TeriockEffect>} Array of sub-effects.
   */
  get subs() {
    const subEffects = [];
    if (this.system.subIds?.length > 0) {
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
   * Gets all sub-effects that are derived from this effect.
   * Always asynchronous.
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
   * Prepares derived data for the effect, handling ability-specific logic and attunement changes.
   * @todo Move this logic to TeriockAbilityData as appropriate.
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
   * Saves the hierarchy relationships by updating sub UUIDs and sup UUID.
   * @returns {Promise<void>} Promise that resolves once the hierarchy data is saved.
   */
  async lockHierarchy() {
    const subs = this.subs;
    const subUuids = subs.map((sub) => sub.uuid);
    const sup = this.sup;
    const supUuid = sup ? sup.uuid : null;
    await this.update({
      "system.subUuids": subUuids,
      "system.supUuid": supUuid,
    });
  }

  /**
   * Removes the hierarchy relationships by clearing sub UUIDs and sup UUID.
   * @returns {Promise<void>} Promise that resolves when the hierarchy data is cleared.
   */
  async unlockHierarchy() {
    await this.update({
      "system.subUuids": [],
      "system.supUuid": null,
    });
  }

  /**
   * Deletes all sub-effects and clears the sub IDs from this effect.
   * @returns {Promise<void>} Promise that resolves when all subs are deleted.
   */
  async deleteSubs() {
    if (this.system?.subIds?.length > 0) {
      const subIds = this.system.subIds;
      await this.update({
        "system.subIds": [],
      });
      await this.parent?.deleteEmbeddedDocuments("ActiveEffect", subIds);
    }
  }

  /**
   * Duplicates the effect and updates parent-child relationships.
   * @todo Create addSub and setSup methods to handle this more generally.
   * @override
   * @returns {Promise<TeriockEffect>} Promise that resolves to the duplicated effect.
   */
  async duplicate() {
    const copy = await super.duplicate();
    const sup = copy.sup;
    if (sup) {
      const supSubIds = sup.system.subIds || [];
      supSubIds.push(copy.id);
      await sup.update({
        "system.subIds": supSubIds,
      });
    }
  }

  /**
   * Disables the effect by setting its `disabled` property to true.
   * @returns {Promise<void>} Promise that resolves when the effect is disabled.
   */
  async disable() {
    await this.update({ disabled: true });
  }

  /**
   * Enables the effect by setting its `disabled` property to false.
   * @returns {Promise<void>} Promise that resolves when the effect is enabled.
   */
  async enable() {
    await this.update({ disabled: false });
  }

  /**
   * Toggles the `disabled` state of the effect.
   * If the effect is currently disabled, it will be enabled, and vice versa.
   * @returns {Promise<void>} Promise that resolves when the disabled state is toggled.
   */
  async toggleDisabled() {
    await this.update({ disabled: !this.disabled });
  }

  /**
   * Forces an update of the effect by toggling the update counter.
   * This is useful for triggering reactive updates in the UI.
   * @returns {Promise<void>} Promise that resolves when the effect is updated.
   */
  async forceUpdate() {
    await this.update({ "system.updateCounter": !this.system.updateCounter });
  }
}
