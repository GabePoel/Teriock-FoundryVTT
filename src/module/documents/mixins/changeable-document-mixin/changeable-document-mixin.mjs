export default (Base) => {
  return (/**
   * @implements {ChangeableDocumentMixinInterface}
   * @extends ClientDocument
   */
  class ChangeableDocumentMixin extends Base {
    changesField = "changes";

    //noinspection ES6ClassMemberInitializationOrder
    overrides = this.overrides ?? {};

    _checkPreparation() {
      return !this.actor || this.actor?._embeddedPreparation;
    }

    * allApplicableEffects() {
      if (this.actor) {
        for (const effect of this.actor.allApplicableEffects()) {
          yield effect;
        }
      }
    }

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
      changes.sort((a, b) => a.priority - b.priority);

      // Apply all changes
      for (const change of changes) {
        if (!change.key) {
          continue;
        }
        const changes = change.effect.apply(this, change);
        Object.assign(overrides, changes);
      }

      // Expand the set of final overrides
      //noinspection JSPotentiallyInvalidUsageOfThis
      this.overrides = foundry.utils.expandObject(overrides);
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