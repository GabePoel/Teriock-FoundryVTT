import { mixClasses } from "../../../../utils/_module.mjs";
import { SelectionPseudoDocumentMixin } from "../../mixins/_module.mjs";

/**
 * An automation that can make its selection during an execution.
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function SelectionAutomationMixin(Base) {
  /**
   * @mixes SelectionPseudoDocument
   * @mixin
   */
  class SelectionAutomation extends mixClasses(Base, SelectionPseudoDocumentMixin) {
    /**
     * The selection made during an execution.
     * @type {{ config: object, document: TeriockDocument|null }|null|undefined}
     */
    _executionSelection;

    /**
     * Resolve the selection made during execution.
     * @param {Teriock.Automations.GetActivationsOptions} [options]
     * @returns {Promise<{ config: object, document: TeriockDocument|null }|null|false>}
     */
    async _resolveSelection(options = {}) {
      if (this._executionSelection !== undefined) { return this._executionSelection; }
      return this._getSelection({ relativeTo: options.execution?.actor ?? options.actor ?? this.actor });
    }

    /** @inheritDoc */
    async cleanupExecution() {
      this._executionSelection = undefined;
    }

    /** @inheritDoc */
    async interactOnExecutionInput(execution) {
      const selection = this.interactInExecution
        ? await this._getSelection({ relativeTo: execution.actor })
        : undefined;
      if (selection === false) { return false; }
      this._executionSelection = selection;
    }
  }

  return SelectionAutomation;
}
