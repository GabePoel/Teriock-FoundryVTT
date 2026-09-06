import { icons } from "../../../constants/display/_module.mjs";
import { makeIcon, makeIconClass } from "../../../helpers/icon.mjs";
import { localizeChoices } from "../../../helpers/localization.mjs";
import { objectMap } from "../../../helpers/utils.mjs";
import { ChoiceSelector } from "../../dialogs/_module.mjs";
import { TeriockDragDrop, TeriockTextEditor } from "../../ux/_module.mjs";
import ChangesSheetMixin from "./changes-sheet-mixin.mjs";

/**
 * @import { ApplicationConfiguration, ApplicationTabsConfiguration } from "@client/applications/_types.mjs";
 * @import { Collection } from "@common/utils/_module.mjs";
 */

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, MechanicsSheet>}
 */
export default function MechanicsSheetMixin(Base) {
  /**
   * @mixes ChangesSheet
   * @mixin
   * @property {TeriockActiveEffect|TeriockActor|TeriockItem} document
   */
  class MechanicsSheet extends ChangesSheetMixin(Base) {
    /**
     * Handle click events to copy the UUID of this Pseudo-Document to clipboard.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onCopyMechanicUuid(event, target) {
      const pseudo = await fromUuid(target.dataset.uuid);
      if (!pseudo) { return; }
      const id = event.button === 2 ? pseudo.id : pseudo.uuid;
      const type = event.button === 2 ? "ID" : "UUID";
      const label = _loc(`DOCUMENT.${pseudo.documentName}`);
      game.clipboard.copyPlainText(id);
      ui.notifications.info("DOCUMENT.IdCopiedClipboard", { format: { id, label, type } });
    }

    /**
     * Create a construction node that's a child of another one.
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onCreateConstructionNode(_event, target) {
      const parentMechanic = await fromUuid(target.dataset.parentUuid);
      if (!parentMechanic) { return; }
      await parentMechanic.createPseudoDocuments("ConstructionNode", [{ parentId: target.dataset.nodeId }]);
    }

    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: {
        copyMechanicUuid: { buttons: [0, 2], handler: this.#onCopyMechanicUuid, suppressContextMenu: true },
        createConstructionNode: this.#onCreateConstructionNode,
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
        tabs: [{ icon: makeIconClass(icons.manifest.pseudoDocument.automation, "solid"), id: "automations" }, {
          icon: makeIconClass(icons.manifest.pseudoDocument.affinity, "solid"),
          id: "affinities",
        }, { icon: makeIconClass(icons.manifest.pseudoDocument.expiration, "solid"), id: "expirations" }],
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
      const choices = localizeChoices(objectMap(config.types, p => p.typeLabel), { sort: true });
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
      await this.document.createPseudoDocuments(config.baseClass.documentName, [{ type: choice }]);
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
      return Object.fromEntries(
        Object.entries(this.document.pseudoCollections).map(([documentName, collection]) => {
          const name = _loc(`DOCUMENT.${documentName}`);
          return [collection.name, {
            addLabel: _loc("TERIOCK.SHEETS.Common.ACTIONS.addChild", { name }),
            baseClass: collection.documentClass,
            collection,
            hint: _loc("TERIOCK.DIALOGS.Select.AddType.hint", { name }),
            icon: icons.manifest.pseudoDocument[documentName.toLowerCase()] ?? icons.manifest.pseudoDocument.mechanic,
            id: collection.name,
            title: _loc("TERIOCK.DIALOGS.Select.AddType.title", { name }),
            types: this.document.getFieldForProperty(this.document.metadata.pseudos[documentName])?.options?.types
              ?? {},
          }];
        }),
      );
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
      if (this.#mechanicsTabBeforeDrag) { this._safeChangeTab(this.#mechanicsTabBeforeDrag, "mechanics"); }
      this.#mechanicsTabBeforeDrag = null;
    }

    /** @inheritDoc */
    async _onDragOver(event) {
      await super._onDragOver(event);
      if (event.dataTransfer.dropEffect === "none" || this._fieldDropTarget(event)) { return; }
      const tabId = this._mechanicCollectionFor(TeriockDragDrop.payload?.type)?.id;
      if (!tabId || tabId === this.tabGroups.mechanics) { return; }
      this.#mechanicsTabBeforeDrag ??= this.tabGroups.mechanics;
      this._safeChangeTab(tabId, "mechanics");
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
      const pseudo = await baseClass.fromDropData(dropData);
      if (!pseudo || !this._validateDrop({ document: pseudo })) { return false; }
      await this.document.createPseudoDocuments(pseudo.documentName, [pseudo.toObject()]);
      return true;
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      this._createContextMenu(
        () => [{
          icon: makeIcon(TERIOCK.display.icons.manifest.ui.duplicate),
          label: _loc("SIDEBAR.Duplicate"),
          onClick: async (_ev, el) => {
            const uuid = el.dataset.uuid;
            if (!uuid) { return; }
            const mechanic = await fromUuid(uuid);
            await mechanic?.duplicate();
          },
          visible: () => this.isEditable,
        }, {
          icon: makeIcon(TERIOCK.display.icons.manifest.ui.delete),
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

  return MechanicsSheet;
}
