import { BaseAutomation } from "../../../../../data/pseudo-documents/automations/_module.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {GenericCommon} document
     */
    class ImpactsCommonSheetPart extends Base {
      static DEFAULT_OPTIONS = {
        actions: {
          createImpact: this._onCreateImpact,
          deleteImpact: this._onDeleteImpact,
        },
      };

      static async _onCreateImpact() {
        await BaseAutomation.createDialog({
          parent: this.document,
          allowedTypes: this.document.metadata.pseudoAutomationTypes,
        });
      }

      /**
       * Delete an impact.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       */
      static async _onDeleteImpact(_event, target) {
        const id = target.dataset.id;
        const impact = this.document.system.automations.get(id);
        await impact.delete();
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        if (this.document.system.automations) {
          const impacts = this.document.system.automations.contents;
          context.impactEditors = await Promise.all(
            impacts.map((i) => i.getEditor()),
          );
        }
        return context;
      }
    }
  );
};
