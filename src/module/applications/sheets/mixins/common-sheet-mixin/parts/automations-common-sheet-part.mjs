import { BaseAutomation } from "../../../../../data/pseudo-documents/automations/abstract/_module.mjs";
import { localizeChoices } from "../../../../../helpers/localization.mjs";
import { makeIcon, objectMap } from "../../../../../helpers/utils.mjs";
import { selectDialog } from "../../../../dialogs/select-dialog.mjs";
import { TeriockContextMenu, TeriockTextEditor } from "../../../../ux/_module.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default Base => {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class AutomationsCommonSheetPart extends Base {
      static DEFAULT_OPTIONS = {
        actions: {
          createAutomation: this._onCreateAutomation,
          deleteAutomation: this._onDeleteAutomation,
          editActiveQualifier: this._onEditActiveQualifier,
          setToggle: this._onSetToggle,
          toggleAutomationCollapse: this._onToggleAutomationCollapse,
        },
      };

      /**
       * Create an automation.
       * @returns {Promise<void>}
       */
      static async _onCreateAutomation() {
        const choices = localizeChoices(objectMap(this.document.system.constructor.automationTypes, a => a.LABEL), {
          sort: true,
        });
        if (Object.keys(choices).length === 0) { return; }
        let choice;
        if (Object.keys(choices).length === 1) { choice = Object.keys(choices)[0]; }
        else {
          choice = await selectDialog(choices, {
            hint: _loc("TERIOCK.DIALOGS.Select.AddAutomation.hint"),
            icon: TERIOCK.display.icons.pseudoDocument.automation,
            required: true,
            title: _loc("TERIOCK.DIALOGS.Select.AddAutomation.title"),
          });
        }
        if (!choice) { return; }
        await BaseAutomation.create({ type: choice }, { parent: this.document });
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
        await automation?.deleteDialog({ modal: true });
      }

      /**
       * Edit an automations active qualifier.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       */
      static async _onEditActiveQualifier(_event, target) {
        const id = target.dataset.id;
        const automation = this.document.system.automations.get(id);
        await automation?.editActiveQualifier();
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
        if (target.dataset.type === "number") { term = Number(term); }
        const set = new Set(Array.from(foundry.utils.getProperty(this.document, name)));
        if (present) { set.delete(term); }
        else { set.add(term); }
        await this.document.update({ [path]: Array.from(set) });
      }

      /**
       * Toggle an automation section's collapsed state.
       * @param {PointerEvent} event
       * @param {HTMLElement} target
       * @this {AutomationsCommonSheetPart}
       */
      static _onToggleAutomationCollapse(event, target) {
        if (event.target.closest(".teriock-automation-header-buttons")) { return; }
        const container = target.closest(".teriock-automation-container");
        const id = container?.dataset.automationId;
        if (!id || !container) { return; }
        if (this._automationCollapsedIds.has(id)) {
          this._automationCollapsedIds.delete(id);
          container.classList.remove("collapsed");
        } else {
          this._automationCollapsedIds.add(id);
          container.classList.add("collapsed");
        }
      }

      /** @inheritDoc */
      constructor(...args) {
        super(...args);
        this._automationCollapsedIds = new Set();
      }

      /**
       * Whether automations can be dropped.
       * @returns {boolean}
       */
      get _canDropAutomations() {
        return this._tab === "automations";
      }

      /**
       * Create an automation on drop.
       * @param {Teriock.Sheet.EmbedDragEvent} event
       * @returns {Promise<void>}
       */
      async _onDropAutomation(event) {
        if (!this._canDropAutomations) { return; }
        const dropData = TeriockTextEditor.getDragEventData(event);
        if (dropData.startSheet === this.id) { return; }
        if (dropData.type !== "Automation") { return; }
        const auto = await BaseAutomation.fromDropData(dropData);
        if (!auto) { return; }
        const data = auto.toObject();
        if (!Object.keys(this.document.system.constructor.automationTypes).includes(data.type)) { return; }
        await BaseAutomation.create(data, { parent: this.document });
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        if (!this.isEditable) { return; }
        new TeriockContextMenu(this.element, ".teriock-automation-header", [{
          icon: makeIcon(TERIOCK.display.icons.ui.duplicate),
          label: _loc("TERIOCK.SYSTEMS.Common.MENU.duplicate"),
          onClick: async (_ev, el) => {
            const uuid = el.dataset.uuid;
            if (!uuid) { return; }
            const auto = await fromUuid(uuid);
            await auto?.duplicate();
          },
        }, {
          icon: makeIcon(TERIOCK.display.icons.ui.delete),
          label: _loc("COMMON.Delete"),
          onClick: async (_ev, el) => {
            const uuid = el.dataset.uuid;
            if (!uuid) { return; }
            const auto = await fromUuid(uuid);
            await auto?.deleteDialog({ modal: true });
          },
        }], { eventName: "contextmenu", fixed: true, jQuery: false });
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        if (this.document.system.automations) {
          const automations = this.document.system.automations.contents;
          context.automationEntries = await Promise.all(automations.map(async automation => {
            const formEditor = await automation.getEditor();
            const messages = automation.formMessages;
            return {
              automation,
              automationCollapsed: this._automationCollapsedIds.has(automation.id),
              formEditor: formEditor.outerHTML,
              messages,
            };
          }));
        }
        return context;
      }
    }
  );
};
