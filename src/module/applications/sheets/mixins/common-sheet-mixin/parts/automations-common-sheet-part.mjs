import { BaseAutomation } from "../../../../../data/pseudo-documents/automations/_module.mjs";
import { objectMap } from "../../../../../helpers/utils.mjs";
import { selectDialog } from "../../../../dialogs/select-dialog.mjs";

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
    class AutomationsCommonSheetPart extends Base {
      static DEFAULT_OPTIONS = {
        actions: {
          createAutomation: this._onCreateAutomation,
          deleteAutomation: this._onDeleteAutomation,
          setToggle: this._onSetToggle,
        },
      };

      /**
       * Create an automation.
       * @returns {Promise<void>}
       */
      static async _onCreateAutomation() {
        //noinspection JSUnresolvedReference
        const choices = objectMap(
          this.document.system.constructor.automationTypes,
          (a) => a.LABEL,
        );
        const choice = await selectDialog(choices, {
          title: "Add Automation",
          hint: "Please select an automation type.",
          icon: TERIOCK.display.icons.document.automation,
        });
        if (!choice) return;
        await BaseAutomation.create(
          { type: choice },
          { parent: this.document },
        );
      }

      /**
       * Delete an automation.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       */
      static async _onDeleteAutomation(_event, target) {
        const id = target.dataset.id;
        const automation = this.document.system.automations.get(id);
        await automation.delete();
      }

      /**
       * Toggle a term's inclusion within a set.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       */
      static async _onSetToggle(_event, target) {
        let term = target.dataset.term;
        const present = target.dataset.present;
        const path = target.dataset.path;
        const name = target.getAttribute("name");
        if (target.dataset.type === "number") term = Number(term);
        const set = new Set(
          Array.from(foundry.utils.getProperty(this.document, name)),
        );
        if (present) set.delete(term);
        else set.add(term);
        await this.document.update({ [path]: Array.from(set) });
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        if (this.document.system.automations) {
          const automations = this.document.system.automations.contents;
          context.automationEntries = await Promise.all(
            automations.map(async (automation) => {
              const formEditor = await automation.getEditor();
              return { automation, formEditor };
            }),
          );
        }
        return context;
      }
    }
  );
};
