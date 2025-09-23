import { applyCertainChanges } from "../shared/_module.mjs";

export default (Base) => {
  return (/**
   * @implements {ChangeableDocumentMixinInterface}
   * @extends ClientDocument
   */
  class ChangeableDocumentMixin extends Base {
    changesField = "changes";

    //noinspection ES6ClassMemberInitializationOrder
    overrides = this.overrides ?? {};

    /** @inheritDoc */
    _checkPreparation() {
      return !this.actor || this.actor?._embeddedPreparation;
    }

    /** @inheritDoc */
    * allApplicableEffects() {
      if (this.actor) {
        for (const effect of this.actor.allApplicableEffects()) {
          yield effect;
        }
      }
    }

    /** @inheritDoc */
    applyActiveEffects() {
      const overrides = {};

      // Organize non-disabled effects by their application priority
      const changes = [];
      for (const effect of this.allApplicableEffects()) {
        if (!effect.active) {
          continue;
        }
        /** @type {EffectChangeData[]} */
        const viableChanges = effect[this.changesField] || [];
        changes.push(...viableChanges.map((change) => {
          const c = foundry.utils.deepClone(change);
          c.effect = effect;
          c.priority ??= c.mode * 10;
          return c;
        }));
      }
      applyCertainChanges(this, changes, overrides);
    }

    /** @inheritDoc */
    prepareEmbeddedDocuments() {
      super.prepareEmbeddedDocuments();
      if (this._checkPreparation()) {
        this.applyActiveEffects();
      }
    }
  });
}