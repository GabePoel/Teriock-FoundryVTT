/**
 * A mixin that can be used by both documents and data models to propagate shared operations.
 * @param {typeof TeriockCommon|typeof CommonSystem} Base
 */
export default function PropagationDataMixin(Base) {
  return (
    /**
     * @mixin
     * @param {TeriockCommon|CommonSystem} Base
     */
    class PropagationData extends Base {
      /**
       * Stuff that happens when a trigger is fired.
       * @param {string} trigger
       */
      _onFireTrigger(trigger) {
        this._propagateOperation("_onFireTrigger", false, [trigger]);
      }

      /**
       * Stuff that happens before a trigger is fired.
       * @param {string} trigger
       * @returns {Promise<void>}
       */
      async _preFireTrigger(trigger) {
        await this._propagateOperation("_preFireTrigger", true, [trigger]);
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
                if (isAsync) await doc[methodName](...args);
                else doc[methodName](...args);
              }
            }
          }
        }
        // Propagate operation to system
        const systemMethod = this.system?.[methodName];
        if (typeof systemMethod === "function") {
          return isAsync
            ? await systemMethod.apply(this.system, args)
            : systemMethod.apply(this.system, args);
        }
      }

      /**
       * Fire a designated trigger.
       * @param {string} trigger
       * @returns {Promise<void>}
       */
      async fireTrigger(trigger) {
        await this._preFireTrigger(trigger);
        this._onFireTrigger(trigger);
      }

      /**
       * Data preparation that happens after `prepareDerivedData()`. This allows {@link TeriockChild} documents to apply
       * changes from the parent {@link TeriockActor} and should be primarily used for that purpose.
       * {@link TeriockActor}s are the only documents that call this directly. In all other cases, it is only called
       * if the parent document calls it.
       */
      prepareSpecialData() {
        this._propagateOperation("prepareSpecialData", false);
      }

      /**
       * Add statuses and explanations for "virtual effects". These are things that would otherwise be represented with
       * {@link TeriockActiveEffect}s, but that we want to be able to add synchronously during the update cycle. Any of
       * these effects that should be shown on the token need to be manually added to {@link TeriockToken._drawEffects}.
       */
      prepareVirtualEffects() {}
    }
  );
}
