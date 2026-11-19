import { BaseRoll } from "../../dice/rolls/_module.mjs";

/**
 * @import { ActiveEffectChangeData } from "@client/documents/_types.mjs";
 */

/**
 * Document mixin for embedded documents that ActiveEffect changes can apply to.
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function ChangeableDocumentMixin(Base) {
  /** @mixin */
  class ChangeableDocument extends Base {
    /**
     * Changes to this document's data that were applied during preparation.
     * @type {object}
     */
    overrides = this.overrides ?? {};

    /**
     * Clear or replace properties not automatically reset by upstream initialization.
     */
    _clearData() {
      this.overrides = {};
      this._completedActiveEffectPhases = new Set();
    }

    /**
     * Get all ActiveEffects that may apply to this document.
     * @yields {TeriockActiveEffect}
     * @returns {Generator<TeriockActiveEffect, void, void>}
     */
    *allApplicableEffects() {}

    /**
     * Apply any transformations to this document's data which are caused by ActiveEffects.
     * @param {Teriock.Changes.Phase} phase
     * @param {Partial<Record<Teriock.Changes.ChildTarget, Teriock.Changes.ChildChangeData[]>>} [inherited]
     */
    applyActiveEffects(phase, inherited = {}) {
      if (!(phase in ActiveEffect.implementation.CHANGE_PHASES) || this._completedActiveEffectPhases.has(phase)) {
        return;
      }
      this._completedActiveEffectPhases.add(phase);
      /** @type {ActiveEffectChangeData[]} */
      const changes = [];
      for (const effect of this.allApplicableEffects()) {
        if (effect.disabled) { continue; }
        for (const change of this.getChangesFromEffect(effect)) {
          if (change.key === "" || change.phase !== phase || !(effect.active || change.applyIfSuppressed)) { continue; }
          const copy = foundry.utils.deepClone(change);
          copy.effect = effect;
          changes.push(copy);
        }
      }
      let qualifierData;
      for (const change of this.selectInheritedChanges(inherited)) {
        if (BaseRoll.qualify(change.qualifier, () => (qualifierData ??= this.system.getLocalRollData()))) {
          changes.push(change);
        }
      }
      if (!changes.length) { return; }
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
     * Get the changes from an active effect that apply to this document.
     * @param {TeriockActiveEffect} _effect
     * @returns {Teriock.Changes.ChangeData[]}
     */
    getChangesFromEffect(_effect) {
      return [];
    }

    /** @inheritDoc */
    prepareBaseData() {
      this._clearData();
      super.prepareBaseData();
    }

    /**
     * Select certain child changes passed along from an actor to apply to this document.
     * @param {Partial<Record<Teriock.Changes.ChildTarget, Teriock.Changes.ChildChangeData[]>>} _inherited
     * @returns {Teriock.Changes.ChildChangeData[]}
     */
    selectInheritedChanges(_inherited) {
      return [];
    }
  }

  return ChangeableDocument;
}
