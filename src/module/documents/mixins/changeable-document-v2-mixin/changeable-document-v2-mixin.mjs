import { TeriockRoll } from "../../../dice/_module.mjs";

/**
 * Mixin for a document that can be changed by a {@link TeriockEffect}.
 * @param {typeof TeriockDocument} Base
 * @mixin
 */
export default function ChangeableDocumentV2Mixin(Base) {
  return (
    /**
     * @extends {ClientDocument}
     * @mixin
     */
    class ChangeableDocumentV2 extends Base {
      /**
       * Build a change tree from an array of expanded changes.
       * @param {TeriockEffect[]} effects
       * @returns {Teriock.Changes.ChangeTree}
       */
      static buildChangeTree(effects) {
        const changeTree =
          /** @type {Teriock.Changes.ChangeTree} */ Object.fromEntries(
            Object.keys(TERIOCK.options.change.time).map((time) => [
              time,
              Object.fromEntries(
                ["Actor", "Item", "ActiveEffect"].map((documentName) => {
                  return [
                    documentName,
                    {
                      untyped: [],
                      typed: Object.fromEntries(
                        Object.keys(CONFIG[documentName].dataModels).map(
                          (k) => [k, []],
                        ),
                      ),
                    },
                  ];
                }),
              ),
            ]),
          );
        for (const effect of effects) {
          if (!effect.active) continue;
          for (const change of effect.qualifiedChanges) {
            const conditionalChange = {
              key: change.key,
              mode: change.mode,
              priority: change.priority,
              value: change.value,
              qualifier: change.qualifier,
              effect: effect,
            };
            const time = change.time;
            const target = change.target;
            if (["Actor", "Item", "ActiveEffect"].includes(target)) {
              changeTree[time][target].untyped.push(conditionalChange);
            } else {
              const documentName = TERIOCK.options.document[target]?.doc;
              if (documentName) {
                changeTree[time][documentName].typed[target].push(
                  conditionalChange,
                );
              }
            }
          }
        }
        return changeTree;
      }

      //noinspection ES6ClassMemberInitializationOrder,JSUnusedGlobalSymbols
      /**
       * An object that tracks which tracks the changes to the data model which were applied by active effects
       * @type {object}
       */
      overrides;

      /** @type {Teriock.Changes.ChangeTree} */
      _changeTree;

      /**
       * The canonical change tree to use.
       * @returns {Teriock.Changes.ChangeTree}
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

      /**
       * Apply certain changes to this document.
       * @param {Teriock.Changes.PreparedChangeData[]} changes
       */
      #applyChanges(changes) {
        changes.sort((a, b) => a.priority - b.priority);
        for (const change of changes) {
          if (!change.key || !change.qualifier) continue;
          let shouldApply = change.qualifier === "1";
          if (!shouldApply) {
            shouldApply = !!TeriockRoll.minValue(
              change.qualifier,
              this.system.getLocalRollData(),
            );
          }
          if (shouldApply) {
            const changeOverrides = change.effect.apply(this, change);
            Object.assign(this.overrides, changeOverrides);
          }
        }
      }

      /**
       * Apply changes to this document based on the time the changes should apply
       * @param {Teriock.Changes.ChangeTime} time
       */
      #applyChangesByTime(time) {
        const partialTree = this.changeTree[time][this.documentName];
        this.#applyChanges([
          ...partialTree.untyped,
          ...partialTree.typed[this.type],
        ]);
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

      /** @inheritDoc */
      prepareBaseData() {
        this.overrides = {};
        super.prepareBaseData();
        this.#applyChangesByTime("base");
        this.#applyChangesByTime("proficiency");
        this.#applyChangesByTime("fluency");
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        this.#applyChangesByTime("derivation");
        this.#applyChangesByTime("final");
      }

      /** @inheritDoc */
      prepareEmbeddedDocuments() {
        super.prepareEmbeddedDocuments();
        if (this._checkPreparation()) {
          this.#applyChangesByTime("normal");
        }
      }
    }
  );
}
