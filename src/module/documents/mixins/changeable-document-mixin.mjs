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
            Object.keys(TERIOCK.options.change.time).map((time) => [
              time,
              Object.fromEntries(
                ["Actor", "Item", "ActiveEffect"].map((documentName) => {
                  const typed = options.allChanges
                    ? Object.fromEntries(
                        Object.keys(CONFIG[documentName].dataModels).map(
                          (k) => [k, []],
                        ),
                      )
                    : {};
                  return [
                    documentName,
                    {
                      untyped: [],
                      uuids: {},
                      typed,
                    },
                  ];
                }),
              ),
            ]),
          );
        for (const effect of effects) {
          if (!effect.active) continue;
          let changes = [...effect.system.changes];
          for (const change of changes) {
            if (change.key.startsWith("system.damage.all")) {
              changes.push(
                ...[
                  {
                    ...change,
                    key: change.key.replace("all", "base"),
                  },
                  {
                    ...change,
                    key: change.key.replace("all", "twoHanded"),
                  },
                ],
              );
            }
          }
          for (const change of changes) {
            const conditionalChange = {
              key: change.key,
              mode: change.mode,
              priority: change.priority,
              value: change.value,
              qualifier: change.qualifier || "1",
              effect: effect,
            };
            const time = change.time || "normal";
            const target = change.target || "Actor";
            if (
              !options.allChanges &&
              (time !== "normal" || !["Actor", "parent"].includes(target))
            ) {
              continue;
            }
            if (target === "parent" && effect.parent) {
              const uuids = changeTree[time][effect.parent.documentName].uuids;
              if (!uuids[effect.parent.uuid]) uuids[effect.parent.uuid] = [];
              uuids[effect.parent.uuid].push(conditionalChange);
            } else if (["Actor", "Item", "ActiveEffect"].includes(target)) {
              changeTree[time][target].untyped.push(conditionalChange);
            } else if (target === "armament") {
              changeTree[time].Item.typed.equipment.push(conditionalChange);
              if (
                !conditionalChange.key.startsWith("system.damage.twoHanded")
              ) {
                changeTree[time].Item.typed.body.push(conditionalChange);
              }
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
      overrides = this.overrides ?? {};

      /**
       * Whether to apply all changes instead of just the hierarchical ones.
       * @returns {boolean}
       */
      get _allChanges() {
        return (
          game.settings.get("teriock", "nonHierarchicalChanges") &&
          this.actor?.getSetting("nonHierarchicalChanges")
        );
      }

      /**
       * Whether this can be changed.
       * @returns {boolean}
       */
      get _canChange() {
        return (
          !!this.collection &&
          (!this.parent ||
            !["Actor", "Item"].includes(this.parent.documentName) ||
            this.parent._embeddedPreparation)
        );
      }

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
          this._buildChangeTree();
          return this._changeTree;
        }
      }

      /**
       * Apply certain changes to this document.
       * @param {Teriock.Changes.PreparedChangeData[]} changes
       */
      _applyChanges(changes) {
        changes.sort((a, b) => a.priority - b.priority);
        let rollData = {};
        let rollDataComputed = false;
        for (const change of changes) {
          if (!change.key || !change.qualifier) continue;
          let shouldApply = change.qualifier === "1";
          if (!shouldApply) {
            if (!rollDataComputed) {
              rollData = this.system.getLocalRollData();
              rollDataComputed = true;
            }
            shouldApply = !!BaseRoll.minValue(change.qualifier, rollData);
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
      _applyChangesByTime(time) {
        if (!this._canChange) return;
        if (
          (time !== "normal" || this.documentName === "ActiveEffect") &&
          !this._allChanges
        ) {
          return;
        }
        const partialTree = this.changeTree[time][this.documentName];
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
       * Build a change tree even if one already exists.
       */
      _buildChangeTree() {
        if (!this.parent?.changeTree) {
          this._changeTree = this.constructor.buildChangeTree(
            this.allApplicableEffects(),
            { allChanges: this._allChanges },
          );
        }
      }

      /** @inheritDoc */
      prepareBaseData() {
        this.overrides = {};
        this._changeTree = undefined;
        super.prepareBaseData();
        if (this._allChanges) {
          this._applyChangesByTime("base");
          this._applyChangesByTime("proficiency");
          this._buildChangeTree();
          this._applyChangesByTime("fluency");
        }
        this._buildChangeTree();
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        this._applyChangesByTime("derivation");
        this._applyChangesByTime("final");
        this.overrides = foundry.utils.expandObject(this.overrides);
      }

      /** @inheritDoc */
      prepareEmbeddedDocuments() {
        this._embeddedPreparation = true;
        super.prepareEmbeddedDocuments();
        this._applyChangesByTime("normal");
        delete this._embeddedPreparation;
      }
    }
  );
}
