import { icons } from "../../../constants/display/icons.mjs";
import { BaseAffinity } from "../../../data/pseudo-documents/affinities/abstract/_module.mjs";
import { BaseAutomation } from "../../../data/pseudo-documents/automations/abstract/_module.mjs";
import { BaseExpiration } from "../../../data/pseudo-documents/expirations/abstract/_module.mjs";
import { makeIcon, makeIconClass } from "../../../helpers/icon.mjs";
import { localizeChoices } from "../../../helpers/localization.mjs";
import { objectMap } from "../../../helpers/utils.mjs";
import { ChoiceSelector } from "../../dialogs/_module.mjs";
import { TeriockDragDrop, TeriockTextEditor } from "../../ux/_module.mjs";
import ChangesSheetMixin from "./changes-sheet-mixin.mjs";

/**
 * @template {Constructor<TeriockDocumentSheet>} T
 * @param {T} Base
 */
export default function MechanicsSheetMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @extends {DragDropSheet}
     * @mixes ChangesSheet
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class MechanicsSheet extends ChangesSheetMixin(Base) {
      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          createMechanic: this._onCreateMechanic,
          deleteMechanic: this._onDeleteMechanic,
          editActiveQualifier: this._onEditActiveQualifier,
          setToggle: this._onSetToggle,
        },
      };

      /** @type {Record<string, Partial<ApplicationTabsConfiguration>>} */
      static TABS = {
        ...super.TABS,
        mechanics: {
          initial: "automations",
          labelPrefix: "EFFECT.TABS",
          tabs: [{ icon: makeIconClass(icons.pseudoDocument.automation, "solid"), id: "automations" }, {
            icon: makeIconClass(icons.pseudoDocument.affinity, "solid"),
            id: "affinities",
          }, { icon: makeIconClass(icons.pseudoDocument.expiration, "solid"), id: "expirations" }],
        },
      };

      /**
       * Create a mechanic in one of the document's mechanic collections.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       * @this {MechanicsSheet}
       */
      static async _onCreateMechanic(_event, target) {
        const config = this._mechanicCollections[target.dataset.collection];
        if (!config) { return; }
        const choices = localizeChoices(objectMap(config.types, p => p.LABEL), { sort: true });
        if (Object.keys(choices).length === 0) { return; }
        let choice;
        if (Object.keys(choices).length === 1) { choice = Object.keys(choices)[0]; }
        else {
          choice = await ChoiceSelector.prompt(choices, {
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

      /** @type {string|null} */
      #mechanicsTabBeforeDrag = null;

      /**
       * Safely show a mechanics tab if it exists.
       * @param {string} id
       */
      #showMechanicsTab(id) {
        if (this.tabGroups.mechanics === id) { return; }
        if (this.element?.querySelector(`.tabs [data-group="mechanics"][data-tab="${id}"]`)) {
          this.changeTab(id, "mechanics");
        } else { this.tabGroups.mechanics = id; }
      }

      /** @inheritDoc */
      get _droppableDocumentNames() {
        return [...super._droppableDocumentNames, ...Object.keys(this.document.pseudoCollections)];
      }

      /**
       * Configuration for each mechanic collection that can be rendered on this document. Keyed off the pseudo-document
       * collections the document actually declares.
       * @returns {Record<string, Teriock.Sheet.MechanicCollectionConfig>}
       */
      get _mechanicCollections() {
        const system = this.document.system;
        const pseudos = system.pseudoCollections ?? {};
        const collections = {};
        if (pseudos.Automation) {
          collections.automations = {
            addLabel: "TERIOCK.SHEETS.Common.NAVIGATION.addAutomation",
            baseClass: BaseAutomation,
            collection: pseudos.Automation,
            hint: _loc("TERIOCK.DIALOGS.Select.AddAutomation.hint"),
            icon: TERIOCK.display.icons.pseudoDocument.automation,
            id: "automations",
            title: _loc("TERIOCK.DIALOGS.Select.AddAutomation.title"),
            types: system.constructor.automationTypes,
          };
        }
        if (pseudos.Affinity) {
          collections.affinities = {
            addLabel: "TERIOCK.SHEETS.Common.NAVIGATION.addAffinity",
            baseClass: BaseAffinity,
            collection: pseudos.Affinity,
            hint: _loc("TERIOCK.DIALOGS.Select.AddAffinity.hint"),
            icon: TERIOCK.display.icons.pseudoDocument.affinity,
            id: "affinities",
            title: _loc("TERIOCK.DIALOGS.Select.AddAffinity.title"),
            types: system.constructor.affinityTypes,
          };
        }
        if (pseudos.Expiration) {
          collections.expirations = {
            addLabel: "TERIOCK.SHEETS.Common.NAVIGATION.addExpiration",
            baseClass: BaseExpiration,
            collection: pseudos.Expiration,
            hint: _loc("TERIOCK.DIALOGS.Select.AddExpiration.hint"),
            icon: TERIOCK.display.icons.pseudoDocument.expiration,
            id: "expirations",
            title: _loc("TERIOCK.DIALOGS.Select.AddExpiration.title"),
            types: system.constructor.expirationTypes,
          };
        }
        return collections;
      }

      /** @inheritDoc */
      _getTabsConfig(group) {
        const config = super._getTabsConfig(group);
        if (group !== "mechanics" || !config) { return config; }
        const collections = this._mechanicCollections;
        const tabs = config.tabs.filter(t => collections[t.id]);
        if (!tabs.some(t => t.id === this.tabGroups.mechanics)) { this.tabGroups.mechanics = null; }
        return { ...config, initial: tabs[0]?.id ?? null, tabs };
      }

      /**
       * The mechanic collection a dropped document name belongs to, if any of them accept it.
       * @param {string} documentName
       * @returns {Teriock.Sheet.MechanicCollectionConfig|undefined}
       */
      _mechanicCollectionFor(documentName) {
        if (!documentName) { return undefined; }
        return Object.values(this._mechanicCollections).find(c => c.baseClass.metadata.documentName === documentName);
      }

      /** @inheritDoc */
      async _onDragLeaveApplication() {
        await super._onDragLeaveApplication();
        if (this.#mechanicsTabBeforeDrag) { this.#showMechanicsTab(this.#mechanicsTabBeforeDrag); }
        this.#mechanicsTabBeforeDrag = null;
      }

      /** @inheritDoc */
      async _onDragOver(event) {
        await super._onDragOver(event);
        if (event.dataTransfer.dropEffect === "none" || this._fieldDropTarget(event)) { return; }
        const tabId = this._mechanicCollectionFor(TeriockDragDrop.payload?.type)?.id;
        if (!tabId || tabId === this.tabGroups.mechanics) { return; }
        this.#mechanicsTabBeforeDrag ??= this.tabGroups.mechanics;
        this.#showMechanicsTab(tabId);
      }

      /** @inheritDoc */
      async _onDrop(event) {
        this.#mechanicsTabBeforeDrag = null;
        await super._onDrop(event);
        const dropData = TeriockTextEditor.getDragEventData(event);
        await this._onDropMechanic(event, dropData);
      }

      /**
       * Create a mechanic from drop data on whichever of the document's mechanic collections it belongs to.
       * @param {DragEvent} _event
       * @param {Teriock.Application.DropData<MechanicPseudoDocument>} dropData
       * @returns {Promise<boolean>} Whether the drop was handled.
       */
      async _onDropMechanic(_event, dropData) {
        const baseClass = this._mechanicCollectionFor(dropData.type)?.baseClass;
        if (!baseClass) { return false; }
        const document = await baseClass.fromDropData(dropData);
        if (!document || !this._validateDrop({ document })) { return false; }
        await baseClass.create(document.toObject(), { parent: this.document });
        return true;
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        this._createContextMenu(
          () => [{
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
          }],
          ".teriock-mechanic-header",
          { eventName: "contextmenu", fixed: true, jQuery: false },
        );
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        const groups = Object.keys(this.constructor.TABS).filter(g => g !== "mechanics");
        if (groups.length === 1) { context.tabs ??= this._prepareTabs(groups[0]); }
        const tabs = this._prepareTabs("mechanics");
        context.mechanicSections = await Promise.all(
          Object.values(this._mechanicCollections).map(async config => {
            return {
              active: tabs[config.id]?.active ?? false,
              addLabel: config.addLabel,
              entries: await this._prepareMechanicEntries(config.collection),
              id: config.id,
            };
          }),
        );
        context.mechanicsTabs = tabs;
        context.splitMechanics = context.mechanicSections.length > 1;
        context.soleMechanicSection = context.mechanicSections.length === 1 ? context.mechanicSections[0] : null;
        return context;
      }

      /**
       * Build the entries for a mechanic collection.
       * @param {Collection<MechanicPseudoDocument>} collection
       * @returns {Promise<Teriock.Sheet.MechanicEntry[]>}
       */
      async _prepareMechanicEntries(collection) {
        const config = { rootId: this.id };
        return Promise.all(collection.contents.map(async mechanic => {
          return { formEditor: (await mechanic.getEditor(config)).outerHTML, mechanic, tips: mechanic.formTips };
        }));
      }

      /** @inheritDoc */
      _validateDropDocument(options) {
        if (!super._validateDropDocument(options)) { return false; }
        if (Object.keys(this.document.pseudoCollections).includes(options.document.documentName)) {
          return this._validateDropMechanic(options);
        }
        return true;
      }

      /**
       * Validates dropping a mechanic.
       * @param {Teriock.Application.DropValidationOptions} options
       * @returns {boolean}
       */
      _validateDropMechanic({ document, notify }) {
        const config = this._mechanicCollectionFor(document.documentName);
        if (!config || !Object.keys(config.types).includes(document.type)) {
          return this._rejectDrop(notify, "TERIOCK.SHEETS.Common.NOTIFICATIONS.cantDropMechanic");
        }
        return true;
      }
    }
  );
}
