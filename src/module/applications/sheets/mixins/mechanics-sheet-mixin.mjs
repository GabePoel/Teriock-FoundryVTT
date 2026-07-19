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
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function MechanicsSheetMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
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

      /**
       * Whether mechanics can be dropped.
       * @returns {boolean}
       */
      get _canDropMechanics() {
        return this._tab === "mechanics" && game.teriock.checkEditable(this);
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
            label: "EFFECT.TABS.automations",
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
            label: "EFFECT.TABS.affinities",
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
            label: "EFFECT.TABS.expirations",
            title: _loc("TERIOCK.DIALOGS.Select.AddExpiration.title"),
            types: system.constructor.expirationTypes,
          };
        }
        return collections;
      }

      /** @inheritDoc */
      _dropEffect(event) {
        const dropEffect = super._dropEffect(event);
        if (dropEffect !== "none") { return dropEffect; }
        if (!this.isEditable || TeriockDragDrop.dragStartApplication === this) { return "none"; }
        return this._mechanicCollectionFor(TeriockDragDrop.payload?.type) ? "copy" : "none";
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
      async _onDrop(event) {
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
        if (!this._canDropMechanics) { return false; }
        const config = this._mechanicCollectionFor(dropData.type);
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
        this._connectContextMenu(".teriock-mechanic-header", [{
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
        const tabs = this._prepareMechanicsTabs();
        context.mechanicSections = await Promise.all(
          Object.entries(this._mechanicCollections).map(async ([id, config]) => {
            return {
              active: tabs[id]?.active ?? false,
              addLabel: config.addLabel,
              entries: await this._prepareMechanicEntries(config.collection),
              id,
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

      /**
       * Build a sub-tab for each mechanic collection this document has.
       * @returns {Record<string, Teriock.Sheet.MechanicTab>}
       */
      _prepareMechanicsTabs() {
        const collections = this._mechanicCollections;
        const active = this.tabGroups?.mechanics ?? Object.keys(collections)[0];
        return Object.entries(collections).reduce((tabs, [id, { icon, label }]) => {
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
}
