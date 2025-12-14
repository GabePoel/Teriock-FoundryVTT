import { applyCertainChanges } from "../shared/_module.mjs";

/**
 * Mixin for a document that can be changed by a {@link TeriockEffect}.
 * @param {typeof TeriockDocument} Base
 * @constructor
 * @mixin
 */
export default function ChangeableDocumentMixin(Base) {
  return (
    /**
     * @extends {ClientDocument}
     */
    class ChangeableDocument extends Base {
      /**
       * What field is used to extract changes from effects.
       * @type {string}
       */
      changesField = "changes";

      //noinspection ES6ClassMemberInitializationOrder,JSUnusedGlobalSymbols
      /**
       * An object that tracks which tracks the changes to the data model which were applied by active effects
       * @type {object}
       */
      overrides = this.overrides ?? {};

      /**
       * The canonical change tree to use.
       * @returns {Teriock.Fields.ChangeTree}
       */
      get changeTree() {
        if (this.parent?.changeTree) {
          return this.parent.changeTree;
        } else if (this._changeTree) {
          return this._changeTree;
        } else {
          this._changeTree = this.constructor.buildChangeTree(
            this.allApplicableEffects(),
          );
          return this._changeTree;
        }
      }

      /** Checks if it's okay to prepare. */
      _checkPreparation() {
        return Boolean(!this.actor) || this.actor?._embeddedPreparation;
      }

      /**
       * Get all ActiveEffects that may apply to this document.
       * @yields {TeriockEffect}
       * @returns {Generator<TeriockEffect, void, void>}
       */
      *allApplicableEffects() {
        if (this.actor) {
          for (const effect of this.actor.allApplicableEffects()) {
            yield effect;
          }
        }
      }

      /**
       * Apply any transformation to the Document data which are caused by ActiveEffects.
       */
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
          changes.push(
            ...viableChanges.map((change) => {
              const c = foundry.utils.deepClone(change);
              c.effect = effect;
              c.priority ??= c.mode * 10;
              return c;
            }),
          );
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
    }
  );
}
