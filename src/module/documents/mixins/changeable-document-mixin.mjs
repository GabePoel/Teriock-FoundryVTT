import { BaseRoll } from "../../dice/rolls/_module.mjs";

/**
 * Mixin for a document that can be changed by a {@link TeriockActiveEffect}.
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
       * @param {TeriockActiveEffect[]} effects
       * @param {object} [options]
       * @param {boolean} [options.allChanges]
       * @returns {Teriock.Changes.ChangeTree}
       */
      static buildChangeTree(effects, options = {}) {
        const changeTree =
          /** @type {Teriock.Changes.ChangeTree} */ Object.fromEntries(
            Object.keys(TERIOCK.config.change.phase).map((phase) => [
              phase,
              Object.fromEntries(
                ["Actor", "Item", "ActiveEffect"].map((documentName) => {
                  const typed = options.allChanges
                    ? Object.fromEntries(
                        Object.keys(CONFIG[documentName].dataModels).map(
                          (k) => [k, []],
                        ),
                      )
                    : {};
                  return [documentName, { untyped: [], uuids: {}, typed }];
                }),
              ),
            ]),
          );
        for (const effect of effects) {
          if (!effect.active) continue;
          let changes = [...effect.system.qualifiedChanges];
          for (const change of changes) {
            const conditionalChange = {
              effect: effect,
              key: change?.key,
              priority: change?.priority,
              qualifier: change.qualifier || "1",
              type: change?.type,
              value: change?.value,
            };
            const phase = change.phase || "normal";
            const target = change.target || "Actor";
            if (
              !options.allChanges &&
              (phase !== "normal" || !["Actor", "parent"].includes(target))
            ) {
              continue;
            }
            if (target === "parent" && effect.parent) {
              const uuids = changeTree[phase][effect.parent.documentName].uuids;
              if (!uuids[effect.parent.uuid]) uuids[effect.parent.uuid] = [];
              uuids[effect.parent.uuid].push(conditionalChange);
            } else if (["Actor", "Item", "ActiveEffect"].includes(target)) {
              changeTree[phase][target].untyped.push(conditionalChange);
            } else if (target === "armament") {
              changeTree[phase].Item.typed.equipment.push(conditionalChange);
              changeTree[phase].Item.typed.body.push(conditionalChange);
            } else {
              const documentName = TERIOCK.config.document[target]?.doc;
              if (documentName) {
                changeTree[phase][documentName].typed[target].push(
                  conditionalChange,
                );
              }
            }
          }
        }
        return changeTree;
      }

      /**
       * Cached result of {@link candidateChanges()} for the current data prep cycle.
       * @type {TeriockActiveEffect[]|undefined}
       */
      _cachedCandidateEffects;

      //noinspection ES6ClassMemberInitializationOrder,JSUnusedGlobalSymbols
      /**
       * An object that tracks which tracks the changes to the data model which were applied by active effects
       * @type {object}
       */
      overrides = this.overrides ?? {};

      /**
       * Whether to apply all changes instead of just the hierarchical ones.
       * @returns {boolean}
       */
      get _allChanges() {
        return (
          game.teriock.getSetting("nonHierarchicalChanges") &&
          (!this.actor ||
            this.actor?.getSetting("automation.nonHierarchicalChanges"))
        );
      }

      /**
       * Whether this can be changed.
       * @returns {boolean}
       */
      get _canChange() {
        return !!this.collection && this._allChanges;
      }

      /** @type {object} */
      _changeReplacementData;

      get changeReplacementData() {
        if (this.parent?.changeReplacementData) {
          return this.parent.changeReplacementData;
        } else if (this._changeReplacementData) {
          return this._changeReplacementData;
        } else {
          return this._buildChangeReplacementData();
        }
      }

      /** @type {Teriock.Changes.ChangeTree} */
      _changeTree;

      /**
       * The canonical change tree to use.
       * @returns {Teriock.Changes.ChangeTree}
       */
      get changeTree() {
        if (this.parent?.changeTree) return this.parent.changeTree;
        else if (this._changeTree) return this._changeTree;
        else return this._buildChangeTree();
      }

      /**
       * Apply certain changes to this document.
       * @param {Teriock.Changes.PreparedChangeData[]} changes
       */
      _applyChanges(changes) {
        changes.sort((a, b) => a?.priority - b?.priority);
        let rollData = {};
        let rollDataComputed = false;
        for (const change of changes) {
          if (!change?.key || !change.qualifier) continue;
          let shouldApply = change.qualifier === "1";
          if (!shouldApply) {
            if (!rollDataComputed) {
              rollData = this.system.getLocalRollData();
              rollDataComputed = true;
            }
            shouldApply = !!BaseRoll.minValue(change.qualifier, rollData);
          }
          if (shouldApply) this._applyIndividualChange(change);
        }
      }

      /**
       * Apply changes to this document based on the time the changes should apply
       * @param {Teriock.Changes.Phase} phase
       */
      _applyChangesByPhase(phase) {
        if (!this._canChange) return;
        const partialTree = this.changeTree[phase][this.documentName];
        const changesToApply = partialTree.uuids[this.uuid] || [];
        if (!this._allChanges) {
          if (this.documentName === "Actor") {
            changesToApply.push(...partialTree.untyped);
          }
        } else {
          changesToApply.push(...partialTree.untyped);
          changesToApply.push(...partialTree.typed[this.type]);
        }
        this._applyChanges(changesToApply);
      }

      /**
       * Apply one change.
       * @param {Teriock.Changes.QualifiedChangeData} change
       */
      _applyIndividualChange(change) {
        const changeOverrides = ActiveEffect.applyChange(this, change, {
          replacementData: this.changeReplacementData,
        });
        Object.assign(this.overrides, changeOverrides);
      }

      /**
       * Build change replacement data even if it already exists.
       * @returns {object}
       */
      _buildChangeReplacementData() {
        if (!this.parent?.changeReplacementData) {
          this._changeReplacementData = this.getRollData();
        }
        return this._changeReplacementData;
      }

      /**
       * Build a change tree even if one already exists.
       * @returns {Teriock.Changes.ChangeTree}
       */
      _buildChangeTree() {
        if (!this.parent?.changeTree) {
          this._changeTree = this.constructor.buildChangeTree(
            this._getCandidateEffects(),
            { allChanges: this._allChanges },
          );
        }
        return this._changeTree;
      }

      /**
       * Effects that may have changes, cached for the current phase.
       * @returns {TeriockActiveEffect[]}
       */
      _getCandidateEffects() {
        if (this._cachedCandidateEffects === undefined) {
          this._cachedCandidateEffects = [...this.candidateChanges()];
        }
        return this._cachedCandidateEffects;
      }

      /**
       * Apply qualified changes for the specified phase to all embedded documents and then this one.
       * @param {Teriock.Changes.Phase} phase
       * @param {boolean} rebuildTree
       * @param {boolean} rebuildData
       */
      _propagateChanges(phase, rebuildTree, rebuildData) {
        this._propagateOperation("_propagateChanges", false, [
          phase,
          rebuildTree,
          rebuildData,
        ]);
        if (this._allChanges) {
          this._applyChangesByPhase(phase);
          if (rebuildTree && this.isTop) this._buildChangeTree();
          if (rebuildData && this.isTop) this._buildChangeReplacementData();
        }
      }

      /**
       * Propagate all the changes that happen before {@link TeriockActor} data is derived.
       * For documents other than actors, these propagate after data is derived.
       */
      _propagateNormalChanges() {
        if (this.isTop) {
          this._propagateChanges("normal", false, false);
        }
      }

      /**
       * Get all ActiveEffects that may have changes.
       * @returns {Generator<AnyActiveEffect, void, void>}
       */
      *candidateChanges() {
        for (const effect of this.allApplicableEffects()) {
          if (effect.system.canChange) yield effect;
        }
      }

      /** @inheritDoc */
      prepareBaseData() {
        this.overrides = {};
        this._changeTree = undefined;
        this._cachedCandidateEffects = undefined;
        super.prepareBaseData();
      }

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();
        this.overrides = foundry.utils.expandObject(this.overrides);
      }
    }
  );
}
