import { ChangesSheetMixin } from "../../_module.mjs";
import { BaseAutomation } from "../../../../../data/pseudo-documents/automations/abstract/_module.mjs";
import { BaseExpiration } from "../../../../../data/pseudo-documents/expirations/abstract/_module.mjs";
import { localizeChoices } from "../../../../../helpers/localization.mjs";
import { makeIcon, makeIconClass, objectMap } from "../../../../../helpers/utils.mjs";
import { selectDialog } from "../../../../dialogs/select-dialog.mjs";
import { TeriockContextMenu } from "../../../../ux/_module.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default Base => {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixes ChangesSheet
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class MechanicsCommonSheetPart extends ChangesSheetMixin(Base) {
      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          createMechanic: this._onCreateMechanic,
          deleteMechanic: this._onDeleteMechanic,
          editActiveQualifier: this._onEditActiveQualifier,
          setToggle: this._onSetToggle,
          toggleMechanicCollapse: this._onToggleMechanicCollapse,
        },
      };

      /**
       * Create a mechanic in one of the document's mechanic collections.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       */
      static async _onCreateMechanic(_event, target) {
        const config = this._mechanicCollections[target.dataset.collection];
        if (!config) { return; }
        const choices = localizeChoices(objectMap(config.types, p => p.LABEL), { sort: true });
        if (Object.keys(choices).length === 0) { return; }
        let choice;
        if (Object.keys(choices).length === 1) { choice = Object.keys(choices)[0]; }
        else {
          choice = await selectDialog(choices, {
            hint: config.hint,
            icon: config.icon,
            required: true,
            title: config.title,
          });
        }
        if (!choice) { return; }
        await config.baseClass.create({ type: choice }, { parent: this.document });
      }

      /**
       * Delete a mechanic.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       */
      static async _onDeleteMechanic(_event, target) {
        const mechanic = await fromUuid(target.dataset.uuid);
        await mechanic?.deleteDialog({ modal: true });
      }

      /**
       * Edit a mechanic's active qualifier.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       */
      static async _onEditActiveQualifier(_event, target) {
        const mechanic = await fromUuid(target.dataset.uuid);
        await mechanic?.editActiveQualifier();
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
       * Toggle a mechanic section's collapsed state.
       * @param {PointerEvent} event
       * @param {HTMLElement} target
       * @this {MechanicsCommonSheetPart}
       */
      static _onToggleMechanicCollapse(event, target) {
        if (event.target.closest(".teriock-mechanic-header-buttons")) { return; }
        const container = target.closest(".teriock-mechanic-container");
        const id = container?.dataset.mechanicId;
        if (!id || !container) { return; }
        if (this._mechanicCollapsedIds.has(id)) {
          this._mechanicCollapsedIds.delete(id);
          container.classList.remove("collapsed");
        } else {
          this._mechanicCollapsedIds.add(id);
          container.classList.add("collapsed");
        }
      }

      /** @inheritDoc */
      constructor(...args) {
        super(...args);
        this._mechanicCollapsedIds = new Set();
      }

      /**
       * Whether mechanics can be dropped.
       * @returns {boolean}
       */
      get _canDropMechanics() {
        return this._tab === "mechanics";
      }

      /**
       * Configuration for each mechanic collection that can be rendered on this document.
       * @returns {Record<string, Teriock.Sheet.MechanicCollectionConfig>}
       */
      get _mechanicCollections() {
        const collections = {};
        if (this.document.system.automations) {
          collections.automations = {
            baseClass: BaseAutomation,
            collection: this.document.system.automations,
            hint: _loc("TERIOCK.DIALOGS.Select.AddAutomation.hint"),
            icon: TERIOCK.display.icons.pseudoDocument.automation,
            title: _loc("TERIOCK.DIALOGS.Select.AddAutomation.title"),
            types: this.document.system.constructor.automationTypes,
          };
        }
        if (this.document.system.expirations) {
          collections.expirations = {
            baseClass: BaseExpiration,
            collection: this.document.system.expirations,
            hint: _loc("TERIOCK.DIALOGS.Select.AddExpiration.hint"),
            icon: TERIOCK.display.icons.pseudoDocument.expiration,
            title: _loc("TERIOCK.DIALOGS.Select.AddExpiration.title"),
            types: this.document.system.constructor.expirationTypes,
          };
        }
        return collections;
      }

      /**
       * Create a mechanic from drop data on whichever of the document's mechanic collections it belongs to.
       * @param {Teriock.Sheet.EmbedDragEvent} _event
       * @param {Teriock.Sheet.DropData<MechanicPseudoDocument>} dropData
       * @returns {Promise<boolean>} Whether the drop was handled.
       */
      async _onDropMechanic(_event, dropData) {
        if (!this._canDropMechanics) { return false; }
        const config = Object.values(this._mechanicCollections).find(c =>
          c.baseClass.metadata.documentName === dropData.type
        );
        if (!config) { return false; }
        const mechanic = await config.baseClass.fromDropData(dropData);
        if (!mechanic) { return false; }
        const data = mechanic.toObject();
        if (!Object.keys(config.types).includes(data.type)) { return false; }
        await config.baseClass.create(data, { parent: this.document });
        return true;
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        if (!this.isEditable) { return; }
        new TeriockContextMenu(this.element, ".teriock-mechanic-header", [{
          icon: makeIcon(TERIOCK.display.icons.ui.duplicate),
          label: _loc("SIDEBAR.Duplicate"),
          onClick: async (_ev, el) => {
            const uuid = el.dataset.uuid;
            if (!uuid) { return; }
            const mechanic = await fromUuid(uuid);
            await mechanic?.duplicate();
          },
          visible: () => this.isEditable,
        }, {
          icon: makeIcon(TERIOCK.display.icons.ui.delete),
          label: _loc("COMMON.Delete"),
          onClick: async (_ev, el) => {
            const uuid = el.dataset.uuid;
            if (!uuid) { return; }
            const mechanic = await fromUuid(uuid);
            await mechanic?.deleteDialog({ modal: true });
          },
          visible: () => this.isEditable,
        }], { eventName: "contextmenu", fixed: true, jQuery: false });
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        const system = this.document.system;
        const hasAutomations = Boolean(system.automations);
        const hasExpirations = Boolean(system.expirations);
        if (hasAutomations) { context.automationEntries = await this._prepareMechanicEntries(system.automations); }
        if (hasExpirations) { context.expirationEntries = await this._prepareMechanicEntries(system.expirations); }
        context.hasAutomations = hasAutomations;
        context.hasExpirations = hasExpirations;
        context.splitMechanics = hasAutomations && hasExpirations;
        context.mechanicsTabs = this._prepareMechanicsTabs();
        return context;
      }

      /**
       * Build the entries for a mechanic collection.
       * @param {Collection<MechanicPseudoDocument>} collection
       * @returns {Promise<Teriock.Sheet.MechanicEntry[]>}
       */
      async _prepareMechanicEntries(collection) {
        return Promise.all(collection.contents.map(async mechanic => {
          return {
            collapsed: this._mechanicCollapsedIds.has(mechanic.id),
            formEditor: (await mechanic.getEditor()).outerHTML,
            mechanic,
            messages: mechanic.formMessages,
          };
        }));
      }

      /**
       * Build mechanics sub-tabs.
       * @returns {Record<"automations"|"expirations", Teriock.Sheet.MechanicTab>}
       */
      _prepareMechanicsTabs() {
        const active = this.tabGroups?.mechanics ?? "automations";
        const config = {
          automations: { icon: TERIOCK.display.icons.pseudoDocument.automation, label: "EFFECT.TABS.automations" },
          expirations: { icon: TERIOCK.display.icons.pseudoDocument.expiration, label: "EFFECT.TABS.expirations" },
        };
        return Object.entries(config).reduce((tabs, [id, { icon, label }]) => {
          const isActive = active === id;
          tabs[id] = {
            active: isActive,
            cssClass: isActive ? "active" : "",
            group: "mechanics",
            icon: makeIconClass(icon, "solid"),
            id,
            label,
          };
          return tabs;
        }, {});
      }
    }
  );
};
