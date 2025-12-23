import { TeriockRoll } from "../../dice/_module.mjs";

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
                      uuids: {},
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
          for (const change of effect.system.changes) {
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
            if (target === "parent" && effect.parent) {
              const uuids = changeTree[time][effect.parent.documentName].uuids;
              if (!uuids[effect.parent.uuid]) uuids[effect.parent.uuid] = [];
              uuids[effect.parent.uuid].push(conditionalChange);
            } else if (["Actor", "Item", "ActiveEffect"].includes(target)) {
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
      overrides = this.overrides ?? {};

      /**
       * Whether this can be changed.
       * @returns {boolean}
       */
      get _canChange() {
        return !this.parent || this.parent._embeddedPreparation;
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
      _applyChangesByTime(time) {
        if (!this._canChange) return;
        const partialTree = this.changeTree[time][this.documentName];
        this._applyChanges([
          ...partialTree.untyped,
          ...partialTree.typed[this.type],
          ...(partialTree.uuids[this.uuid] || []),
        ]);
      }

      /**
       * Build a change tree even if one already exists.
       */
      _buildChangeTree() {
        if (!this.parent?.changeTree) {
          this._changeTree = this.constructor.buildChangeTree(
            this.allApplicableEffects(),
          );
        }
      }

      /** @inheritDoc */
      prepareBaseData() {
        this.overrides = {};
        this._changeTree = undefined;
        super.prepareBaseData();
        this._applyChangesByTime("base");
        this._applyChangesByTime("proficiency");
        this._buildChangeTree();
        this._applyChangesByTime("fluency");
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
