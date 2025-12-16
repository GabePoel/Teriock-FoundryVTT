import { applyCertainChanges } from "../shared/_module.mjs";

/**
 * Mixin for a document that can be changed by a {@link TeriockEffect}.
 * @param {typeof TeriockDocument} Base
 * @mixin
 */
export default function ChangeableDocumentMixin(Base) {
  return (
    /**
     * @extends {ClientDocument}
     * @mixin
     */
    class ChangeableDocument extends Base {
      /**
       * Build a change tree from an array of expanded changes.
       * @param {TeriockEffect[]} effects
       * @returns {Teriock.Fields.ChangeTree}
       */
      static buildChangeTree(effects) {
        const emptyTypeChangeTree = {
          ActiveEffect: {
            ...Object.fromEntries(
              Object.keys(CONFIG.ActiveEffect.dataModels).map((k) => [k, []]),
            ),
            all: [],
          },
          Actor: {
            ...Object.fromEntries(
              Object.keys(CONFIG.Actor.dataModels).map((k) => [k, []]),
            ),
            all: [],
          },
          Item: {
            ...Object.fromEntries(
              Object.keys(CONFIG.Item.dataModels).map((k) => [k, []]),
            ),
            all: [],
          },
        };
        const changeTree =
          /** @type {Teriock.Fields.ChangeTree} */ Object.fromEntries(
            Object.keys(TERIOCK.options.change.time).map((time) => [
              time,
              foundry.utils.deepClone(emptyTypeChangeTree),
            ]),
          );
        for (const effect of effects) {
          if (!effect.active) continue;
          for (const change of effect.expandedChanges) {
            const conditionalChange = {
              key: change.key,
              mode: change.mode,
              priority: change.priority,
              value: change.value,
              condition: change.condition,
              effect: effect,
            };
            const timeKey = change.time || "preDerivation";
            const typeKey = change.type || "all";
            const documentNameKey =
              TERIOCK.options.document[typeKey]?.doc ||
              change.documentName ||
              "Actor";
            changeTree[timeKey][documentNameKey][typeKey].push(
              conditionalChange,
            );
          }
        }
        return changeTree;
      }

      //noinspection ES6ClassMemberInitializationOrder,JSUnusedGlobalSymbols
      /**
       * An object that tracks which tracks the changes to the data model which were applied by active effects
       * @type {object}
       */
      overrides = this.overrides ?? {};

      /** @type {Teriock.Fields.ChangeTree} */
      _changeTree;

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
        const docChanges = this.changeTree[this.documentName].all;
        const typeChanges = this.changeTree[this.documentName][this.type];
        const changes = [...docChanges, ...typeChanges];
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
