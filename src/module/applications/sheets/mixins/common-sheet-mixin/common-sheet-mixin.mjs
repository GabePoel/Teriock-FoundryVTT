import { toTitleCase } from "../../../../helpers/string.mjs";
import { makeIcon, mix } from "../../../../helpers/utils.mjs";
import { bindCommonActions } from "../../../shared/_module.mjs";
import { TeriockContextMenu, TeriockTextEditor } from "../../../ux/_module.mjs";
import { ConfigButtonSheetMixin, IndexButtonSheetMixin } from "../_module.mjs";
import * as parts from "./parts/_module.mjs";

/**
 * {@link TeriockCommon} sheet mixin.
 * @param {typeof TeriockDocumentSheet} Base - The base application class to mix in with.
 */
export default function CommonSheetMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {CommonSheetMixinInterface}
     * @extends {TeriockDocumentSheet}
     * @mixes DocumentCreationCommonSheetPart
     * @mixes DragDropCommonSheetPart
     * @mixes FieldsCommonSheetPart
     * @mixes GmNotesCommonSheetPart
     * @mixes ImageEditingCommonSheetPart
     * @mixes ImpactsTabsCommonSheetPart
     * @mixes InteractionCommonSheetPart
     * @mixes LockingCommonSheetPart
     * @mixes MenuCommonSheetPart
     * @mixes StatDiceCommonSheetPart
     * @mixes ToggleCommonSheetPart
     * @mixin
     * @property {GenericCommon} document
     */
    class CommonSheet extends mix(
      Base,
      ConfigButtonSheetMixin,
      parts.DragDropCommonSheetPart,
      parts.DocumentCreationCommonSheetPart,
      parts.FieldsCommonSheetPart,
      parts.GmNotesCommonSheetPart,
      parts.ImageEditingCommonSheetPart,
      parts.ImpactsTabsCommonSheetPart,
      parts.InteractionCommonSheetPart,
      parts.LockingCommonSheetPart,
      parts.MenuCommonSheetPart,
      parts.StatDiceCommonSheetPart,
      parts.ToggleCommonSheetPart,
      parts.ImpactsCommonSheetPart,
      IndexButtonSheetMixin,
    ) {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS =
        /** @type {Partial<ApplicationConfiguration>} */ {
          actions: {
            openDoc: this._onOpenDoc,
          },
          form: {
            closeOnSubmit: false,
            submitOnChange: true,
          },
          position: {
            height: 600,
            width: 560,
          },
          window: {
            resizable: true,
          },
        };

      /**
       * Creates a new Teriock sheet instance.
       * Initializes sheet state including settings.
       * @param {...any} args - Arguments to pass to the base constructor.
       */
      constructor(...args) {
        super(...args);
        this.settings = {};
      }

      /**
       * Open a linked document.
       * @param {PointerEvent} _event
       * @param {HTMLEmbedElement} target
       * @returns {Promise<void>}
       */
      static async _onOpenDoc(_event, target) {
        const uuid = target.dataset.uuid;
        const doc = await fromUuid(uuid);
        await doc.sheet.render(true);
      }

      /**
       * Connects event handlers to elements matching a selector.
       * @param {string} selector - The CSS selector for elements to connect.
       * @param {string} eventType - The event type to listen for.
       * @param {Function} handler - The event handler function.
       */
      _connect(selector, eventType, handler) {
        this.element.querySelectorAll(selector).forEach((el) =>
          el.addEventListener(eventType, (e) => {
            e.stopPropagation();
            e.preventDefault();
            handler(e);
          }),
        );
      }

      /**
       * Build and connect context menu entries that update this document from some object.
       * @param {string} cssClass - The CSS class for elements to attach the menu to.
       * @param {object} obj - Object with keys, names, and icons.
       * @param {string} path - Path of document to update.
       * @param {string} eventName - The event name to trigger the menu.
       */
      _connectBuildContextMenu(cssClass, obj, path, eventName) {
        this._connectContextMenu(
          cssClass,
          Object.entries(obj).map(([k, v]) => {
            return {
              name: v.name || toTitleCase(k),
              icon: makeIcon(v.icon, "contextMenu"),
              callback: async () => {
                await this.document.update({ [path]: k });
              },
            };
          }),
          eventName,
        );
      }

      /**
       * Creates a context menu for elements.
       * @param {string} cssClass - The CSS class for elements to attach the menu to.
       * @param {object[]} menuItems - The context menu items.
       * @param {string} eventName - The event name to trigger the menu.
       * @param {"up"|"down"} [direction] - Direction for the context menu to expand.
       * @returns {ContextMenu} The created context menu.
       */
      _connectContextMenu(cssClass, menuItems, eventName, direction) {
        return /** @type {ContextMenu} */ new TeriockContextMenu(
          this.element,
          cssClass,
          menuItems,
          {
            eventName,
            jQuery: false,
            fixed: false,
            forceDirection: direction,
          },
        );
      }

      /**
       * Enriches HTML content for display.
       * @param {string} parameter - The HTML content to enrich.
       * @returns {Promise<string|undefined>} Promise that resolves to the enriched HTML or undefined.
       */
      async _enrich(parameter) {
        return parameter?.length
          ? await TeriockTextEditor.enrichHTML(parameter, {
              relativeTo: this.document,
            })
          : undefined;
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        bindCommonActions(this.element);
        this._connect("[data-debug]", "contextmenu", () => {
          if (game.settings.get("teriock", "developerMode")) {
            console.log("Debug", this.document, this);
          }
        });
        this.element.querySelectorAll(".teriock-block[data-uuid]").forEach(
          /** @param {HTMLElement} el */ (el) => {
            const uuid = el.dataset.uuid;
            fromUuid(uuid).then((doc) => doc.onEmbed(el));
          },
        );
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        let children = await this.document.getVisibleChildren();
        children = children.filter((c) => {
          if (foundry.utils.hasProperty(c, "system.revealed")) {
            return (
              foundry.utils.getProperty(c, "system.revealed") || game.user.isGM
            );
          } else {
            return true;
          }
        });
        for (const [type, options] of Object.entries(
          TERIOCK.options.document,
        )) {
          if (options.getter) {
            context[options["getter"]] = TERIOCK.options.document[type].sorter(
              children.filter((c) => c.type === type),
            );
          }
        }
        Object.assign(context, {
          TERIOCK: TERIOCK,
          document: this.document,
          editable: this.isEditable,
          enriched: {},
          fields: this.document.schema.fields,
          flags: this.document.flags,
          id: this.document.id,
          img: this.document.img,
          isGM: game.user.isGM,
          limited: this.document.limited,
          metadata: this.document.metadata,
          name: this.document.name,
          owner: this.document.isOwner,
          settings: this.settings,
          source: this.document._source,
          system: this.document.system,
          systemFields: this.document.system.schema.fields,
          systemSource: this.document.system._source,
          uuid: this.document.uuid,
          sheetId: this.id,
        });
        return context;
      }

      /** @inheritDoc */
      async _renderFrame(options = {}) {
        const frame = await super._renderFrame(options);
        if (this.document.inCompendium) {
          this.window.header.style.backgroundColor =
            "var(--compendium-sheet-header-background-color)";
        }
        return frame;
      }
    }
  );
}
