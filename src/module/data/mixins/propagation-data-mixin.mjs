const SCOPE_MAP = { ActiveEffect: "effect", Actor: "actor", Automation: "automation", Item: "item" };

/**
 * A mixin that can be used by both documents and data models to propagate shared operations.
 * @param {typeof BaseDocument|typeof TypeDataModel} Base
 */
export default function PropagationDataMixin(Base) {
  return (
    /**
     * @mixin
     */
    class PropagationData extends Base {
      /**
       * Stuff that happens when a trigger event is fired.
       * @param {string} trigger
       * @param {Teriock.System.TriggerScope} [scope]
       */
      _onFireTrigger(trigger, scope = {}) {
        this._propagateOperation("_onFireTrigger", false, [trigger, scope]);
      }

      /**
       * Stuff that happens before a trigger event is fired.
       * @param {string} trigger
       * @param {Teriock.System.TriggerScope} [scope]
       * @returns {Promise<void>}
       */
      async _preFireTrigger(trigger, scope = {}) {
        await this._propagateOperation("_preFireTrigger", true, [trigger, scope]);
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
        const collections = this.constructor.metadata?.embedded || {};
        for (const path of Object.values(collections)) {
          const collection = foundry.utils.getProperty(this, path);
          if (collection) {
            for (const doc of collection) {
              if (typeof doc[methodName] === "function") {
                if (isAsync) { await doc[methodName](...args); }
                else { doc[methodName](...args); }
              }
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
       * Fire a designated trigger event.
       * @param {string} trigger
       * @param {Teriock.System.TriggerScope} [scope]
       * @returns {Promise<void>}
       */
      async fireTrigger(trigger, scope = {}) {
        await this._preFireTrigger(trigger, scope);
        this._onFireTrigger(trigger, scope);
      }

      /**
       * A scope that can be used when executing macros from a fired trigger event.
       * @param {Partial<Teriock.System.TriggerScope>} [scope]
       * @returns {Teriock.System.TriggerScope}
       */
      getScope(scope = {}) {
        scope = { ...scope };
        if (SCOPE_MAP[this.documentName]) { scope[SCOPE_MAP[this.documentName]] = this; }
        if (this.parent && typeof this.parent.getScope === "function") { Object.assign(scope, this.parent.getScope()); }
        return scope;
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
       * Data preparation that happens after `prepareDerivedData()`. This allows {@link AnyChildDocument} documents to
       * apply changes from the parent {@link TeriockActor} and should be primarily used for that purpose.
       * {@link TeriockActor}s are the only documents that call this directly. In all other cases, it is only called
       * if the parent document calls it.
       */
      prepareSpecialData() {
        this._propagateOperation("prepareSpecialData", false);
      }
    }
  );
}
