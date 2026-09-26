/**
 * @import { TypeDataModel } from "@common/abstract/_module.mjs";
 */

const SCOPE_MAP = { ActiveEffect: "effect", Actor: "actor", Automation: "automation", Item: "item" };

/**
 * A mixin that can be used by both documents and data models to propagate shared operations.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, PropagationData>}
 */
export default function PropagationDataMixin(Base) {
  /** @mixin */
  class PropagationData extends Base {
    /**
     * Collections that this propagates operations through.
     * @returns {Collection[]}
     */
    get _propagationCollections() {
      return [...Object.values(this.collections ?? {}), ...Object.values(this.pseudoCollections ?? {})];
    }

    /**
     * Stuff that happens after a document this belongs to is updated.
     * @returns {Promise<void>}
     */
    async _onUpdateDocument() {
      await this._propagateOperation("_onUpdateDocument", true);
    }

    /**
     * Internal helper to propagate methods through documents and their systems.
     * @param {string} methodName - The method to call.
     * @param {boolean} isAsync - Whether to await the calls.
     * @param {Array} [args] - Arguments to pass.
     * @returns {Promise<void>|void}
     */
    async _propagateOperation(methodName, isAsync = false, args = []) {
      // Propagate operation to embedded collections
      for (const collection of this._propagationCollections) {
        for (const doc of collection) {
          if (typeof doc[methodName] === "function") {
            if (isAsync) { await doc[methodName](...args); }
            else { doc[methodName](...args); }
          }
        }
      }
      // Propagate operation to system
      const systemMethod = this.system?.[methodName];
      if (typeof systemMethod === "function") {
        return isAsync ? await systemMethod.apply(this.system, args) : systemMethod.apply(this.system, args);
      }
    }

    /**
     * A scope built from this and its ancestors. Explicit keys win over this which wins over ancestors.
     * @param {Partial<Teriock.System.TriggerScope>} [scope]
     * @returns {Teriock.System.TriggerScope}
     */
    getScope(scope = {}) {
      const key = SCOPE_MAP[this.documentName];
      return { ...(this.parent?.getScope?.() ?? {}), ...(key ? { [key]: this } : {}), ...scope };
    }

    /**
     * Data preparation that sets up qualified changes to be added as normal changes.
     */
    prepareChangeData() {
      this._propagateOperation("prepareChangeData", false);
    }

    /**
     * The final step of data preparation that happens after `prepareSpecialData()`. This ensures that values are
     * constrained by maximum and minimum values.
     */
    prepareCleanupData() {
      this._propagateOperation("prepareCleanupData", false);
    }

    /**
     * Data preparation that happens after `prepareDerivedData()`. This allows child documents to
     * apply changes from the parent {@link TeriockActor} and should be primarily used for that purpose.
     * {@link TeriockActor}s are the only documents that call this directly. In all other cases, it is only called
     * if the parent document calls it.
     */
    prepareSpecialData() {
      this._propagateOperation("prepareSpecialData", false);
    }
  }

  return PropagationData;
}
