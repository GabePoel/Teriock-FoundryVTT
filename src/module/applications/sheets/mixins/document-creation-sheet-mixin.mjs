import { makeIconClass } from "../../../helpers/icon.mjs";
import { TeriockDialog } from "../../api/_module.mjs";
import { DocumentSelector, selectDocument } from "../../dialogs/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, DocumentCreationSheet>}
 */
export default function DocumentCreationSheetMixin(Base) {
  /**
   * @mixin
   * @property {TeriockActiveEffect|TeriockActor|TeriockItem} document
   */
  class DocumentCreationSheet extends Base {
    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = { actions: { createChild: this._onCreateChild } };

    /**
     * Create the add button's default child type (its `data-type`) on left-click. Buttons without a default `data-type`
     * open a context menu instead (see {@link _connectChildrenCreateMenu}).
     * @this {DocumentCreationSheet}
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async _onCreateChild(_event, target) {
      const type = /** @type {Teriock.Documents.ChildType|undefined} */ target.dataset.type;
      if (type) { await this._createChild(type); }
    }

    /**
     * Connect the child-creation context menus. Menu entries cover every child type but are only visible when their
     * type appears in the clicked button's `data-types`. Buttons with no default `data-type` open the menu on
     * left-click; buttons with a default (created directly on left-click via {@link _onCreateChild}) expose the full
     * list on right-click.
     */
    _connectChildrenCreateMenu() {
      const entries = () =>
        Object.entries(TERIOCK.config.document).filter(([, config]) =>
          ["ActiveEffect", "Item"].includes(config.documentName)
        ).map(([type, config]) => ({
          icon: makeIconClass(config.icon, "contextMenu"),
          label: _loc("TERIOCK.SHEETS.Common.PREVIEW.addType", { type: config.label }),
          onClick: () => this._createChild(type),
          visible: target => parseAddTypes(target).includes(type) && this.isEditable,
        }));
      this._createContextMenu(entries, ".add-button[data-types]:not([data-type])", {
        eventName: "click",
        fixed: true,
        relative: "target",
      });
      this._createContextMenu(entries, ".add-button[data-types][data-type]", {
        eventName: "contextmenu",
        fixed: true,
        relative: "target",
      });
    }

    /**
     * Create a child document of the given type.
     * @this {DocumentCreationSheet}
     * @param {Teriock.Documents.ChildType} type
     * @returns {Promise<void>}
     */
    async _createChild(type) {
      switch (type) {
        case "rank":
          return this._onCreateRank();
        case "fluency":
          return this._onCreateFluency();
        default: {
          const obj = await resolveCreateObject(type);
          if (!obj) { return; }
          await this.document.createChildDocuments(TERIOCK.config.document[type]?.documentName, [obj], {
            interactive: true,
          });
        }
      }
    }

    /**
     * Adds a new fluency to the current document.
     * @returns {Promise<void>}
     */
    async _onCreateFluency() {
      const tc = await selectDocument("tradecraft", {
        globalIdentifiers: Object.keys(TERIOCK.config.tradecraft.tradecrafts).map(t => `tradecraft:${t}`),
        globalTypes: [],
      });
      if (!tc) { return; }
      await this.document.createChildDocuments("ActiveEffect", [{
        img: tc.img,
        name: _loc("TERIOCK.SHEETS.Common.MENU.Create.fluency", { tradecraft: tc.name }),
        system: { field: tc.system._source.field, tradecraft: tc.system.identifier },
        type: "fluency",
      }]);
    }

    /**
     * Adds a new rank to the current document.
     * @returns {Promise<void>}
     */
    async _onCreateRank() {
      const classDocument = await selectDocument("class", {
        globalIdentifiers: Object.keys(TERIOCK.config.class.classes).map(c => `class:${c}`),
        globalTypes: [],
      });
      if (!classDocument) { return; }
      const globalIdentifiers = Array.from(classDocument?.system.ranks ?? []);
      const selectedRanks = await DocumentSelector.selectFromConfig({ globalIdentifiers }, {
        hint: _loc("TERIOCK.DIALOGS.Select.Name.hint", {
          name: TERIOCK.config.document.rank.label?.toLocaleLowerCase(game.i18n.lang),
        }),
        title: _loc("TERIOCK.DIALOGS.Select.Name.title", { name: TERIOCK.config.document.rank.label }),
      });
      if (!selectedRanks?.length) { return; }
      const referenceRank = selectedRanks[0];
      const toCreate = game.items.fromCompendium(referenceRank);
      toCreate.system = foundry.utils.mergeObject(toCreate.system || {}, {
        origin: this.document.documentName === "Actor" ? "learned" : "innate",
      });
      await this.document.createChildDocuments("Item", [toCreate], { interactive: true });
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      this._connectChildrenCreateMenu();
    }
  }

  return DocumentCreationSheet;
}

/**
 * Parse an add button's `data-types` attribute into a list of child types.
 * @param {HTMLElement} [target]
 * @returns {Teriock.Documents.ChildType[]}
 */
function parseAddTypes(target) {
  return (target?.dataset.types ?? "").split(",").map(type => type.trim()).filter(Boolean);
}

/**
 * Resolve a creation object from config, optionally via the new-document import dialog.
 * @param {Teriock.Documents.ChildType} type
 * @returns {Promise<object|null>}
 */
async function resolveCreateObject(type) {
  const obj = {
    name: _loc("TERIOCK.SHEETS.Common.MENU.Create.document", { type: TERIOCK.config.document[type]?.label }),
    type,
  };
  if (!TERIOCK.config.document[type]?.importDialog) { return obj; }
  const label = TERIOCK.config.document[type]?.label;
  const typeName = label.toLowerCase();
  const decision = await TeriockDialog.prompt({
    buttons: [{
      icon: makeIconClass(TERIOCK.display.icons.manifest.ui.custom, "button"),
      label: _loc("CONTROLS.CommonCreate"),
      callback: () => "create",
    }],
    content: _loc("TERIOCK.DIALOGS.NewDocument.content", { typeName }),
    modal: true,
    ok: {
      default: true,
      icon: makeIconClass(TERIOCK.display.icons.manifest.ui.import, "button"),
      label: _loc("APPLICATION.ACTIONS.ImportDocument"),
      callback: () => "import",
    },
    window: {
      icon: makeIconClass(TERIOCK.display.icons.manifest.ui.add, "title"),
      title: _loc("TERIOCK.DIALOGS.NewDocument.title", { name: label }),
    },
  });
  if (!decision) { return null; }
  if (decision === "import") {
    const selected = type === "equipment"
      ? await selectDocument("equipment", { globalPacks: ["teriock.equipment"], globalTypes: [] })
      : await selectDocument(type);
    if (!selected) { return null; }
    if (selected.documentName === "Item") { return game.items.fromCompendium(selected); }
    return foundry.utils.mergeObject(selected.toObject(), { _stats: { compendiumSource: selected.uuid } });
  }
  return obj;
}
