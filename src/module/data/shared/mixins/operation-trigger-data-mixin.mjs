/**
 * Time-based operation triggers. This should be used for both documents and their systems.
 * @param {typeof PropagationData} Base
 */
export default function OperationTriggerDataMixin(Base) {
  return class OperationTriggerData extends Base {
    /**
     * Things that happen after a dawn operation.
     */
    _onDawn() {
      this._propagateOperation("_onDawn", false);
    }

    /**
     * Things that happen after a dusk operation.
     */
    _onDusk() {
      this._propagateOperation("_onDusk", true);
    }

    /**
     * Things that happen after a long rest operation.
     */
    _onLongRest() {
      this._propagateOperation("_onLongRest", true);
    }

    /**
     * Things that happen after a short rest operation.
     */
    _onShortRest() {
      this._propagateOperation("_onShortRest", true);
    }

    /**
     * Things that happen before a dawn operation.
     * @returns {Promise<void>}
     */
    async _preDawn() {
      await this._propagateOperation("_preDawn", true);
    }

    /**
     * Things that happen before a dusk operation.
     * @returns {Promise<void>}
     */
    async _preDusk() {
      await this._propagateOperation("_preDusk", true);
    }

    /**
     * Things that happen before a long rest operation.
     * @returns {Promise<void>}
     */
    async _preLongRest() {
      await this._propagateOperation("_preLongRest", true);
    }

    /**
     * Things that happen before a short rest operation.
     * @returns {Promise<void>}
     */
    async _preShortRest() {
      await this._propagateOperation("_preShortRest", true);
    }

    /**
     * Complete all operations related to a given trigger.
     * @param {Teriock.System.TimeTrigger} trigger
     */
    async fireTrigger(trigger) {
      switch (trigger) {
        case "dawn":
          await this._preDawn();
          this._onDawn();
          break;
        case "dusk":
          await this._preDusk();
          this._onDusk();
          break;
        case "longRest":
          await this._preLongRest();
          this._onLongRest();
          break;
        case "shortRest":
          await this._preShortRest();
          this._onShortRest();
          break;
      }
    }
  };
}
