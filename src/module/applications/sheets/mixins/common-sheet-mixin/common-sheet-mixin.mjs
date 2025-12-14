import { mix } from "../../../../helpers/utils.mjs";
import { bindCommonActions } from "../../../shared/_module.mjs";
import { TeriockContextMenu, TeriockTextEditor } from "../../../ux/_module.mjs";
import {
  IndexButtonSheetMixin,
  QualifierButtonSheetMixin,
} from "../_module.mjs";
import _connectEmbedded from "./methods/_connect-embedded.mjs";
import _setupEventListeners from "./methods/_setup-handlers.mjs";
import * as parts from "./parts/_module.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * {@link TeriockCommon} sheet mixin.
 * @param {typeof DocumentSheetV2} Base - The base application class to mix in with.
 * @constructor
 */
export default function CommonSheetMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {CommonSheetMixinInterface}
     * @extends {DocumentSheetV2}
     * @mixes DocumentCreationCommonSheetPart
     * @mixes DragDropCommonSheetPart
     * @mixes LockingCommonSheetPart
     * @mixes InteractionCommonSheetPart
     * @mixin
     * @property {TeriockCommon} document
     */
    class CommonSheet extends mix(
      Base,
      HandlebarsApplicationMixin,
      QualifierButtonSheetMixin,
      parts.DragDropCommonSheetPart,
      parts.DocumentCreationCommonSheetPart,
      parts.InteractionCommonSheetPart,
      parts.LockingCommonSheetPart,
      IndexButtonSheetMixin,
    ) {
      //noinspection JSValidateTypes
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          changeImpactTab: this._onChangeImpactTab,
          editImage: this._onEditImage,
          gmNotesOpen: this._onGmNotesOpen,
          quickToggle: this._onQuickToggle,
          setStatDice: this._onSetStatDice,
          sheetToggle: this._onSheetToggle,
          toggleImpacts: this._onToggleImpacts,
          unlinkMacro: this._onUnlinkMacro,
          openDoc: this._onOpenDoc,
        },
        classes: ["teriock", "ability"],
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
       * Template parts configuration.
       * @type {object}
       */
      static PARTS = {};

      /**
       * Creates a new Teriock sheet instance.
       * Initializes sheet state including menu state, context menus, and settings.
       * @param {...any} args - Arguments to pass to the base constructor.
       */
      constructor(...args) {
        super(...args);
        this._impactTab = "base";
        this._menuOpen = false;
        this._tab = "overview";
        this.settings = {};
      }

      /**
       * Switches to a specific impacts tab.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when tab is switched.
       * @static
       */
      static async _onChangeImpactTab(_event, target) {
        this._impactTab = target.dataset.tab;
        await this.render();
      }

      /**
       * Opens image picker for editing document images.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when image picker is opened.
       */
      static async _onEditImage(event, target) {
        event.stopPropagation();
        const attr = target.dataset.edit;
        const current = foundry.utils.getProperty(this.document, attr);
        //noinspection JSUnresolvedReference
        const defaultImg = this.document.constructor.getDefaultArtwork?.(
          this.document.toObject(),
        )?.img;
        const options = {
          current,
          type: "image",
          redirectToRoot: defaultImg ? [defaultImg] : [],
          callback: (path) => this.document.update({ [attr]: path }),
          top: this.position.top + 40,
          left: this.position.left + 10,
        };
        await new foundry.applications.apps.FilePicker(options).browse();
      }

      /**
       * Opens the GM notes page or makes one if one doesn't already exist.
       * @returns {Promise<void>}
       * @private
       */
      static async _onGmNotesOpen() {
        await this.document.system.gmNotesOpen();
      }

      /**
       * Open a linked document.
       * @param {PointerEvent} _event
       * @param {HTMLEmbedElement} target
       * @returns {Promise<void>}
       * @private
       */
      static async _onOpenDoc(_event, target) {
        const uuid = target.dataset.uuid;
        const doc = await fromUuid(uuid);
        await doc.sheet.render(true);
      }

      /**
       * Toggles a boolean field on the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when toggle is complete.
       */
      static async _onQuickToggle(_event, target) {
        const { path } = target.dataset;
        const current = target.dataset.bool === "true";
        await this.document.update({ [path]: !current });
      }

      /**
       * Modify a specified stat pool.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       * @private
       */
      static async _onSetStatDice(_event, target) {
        if (!this.editable) {
          return;
        }
        const stat = target.dataset.stat;
        const pool =
          /** @type {StatPoolModel} */ this.document.system.statDice[stat];
        await pool.setStatDice();
      }

      /**
       * Toggles a boolean field on the sheet and re-renders.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when toggle is complete.
       */
      static async _onSheetToggle(_event, target) {
        const { path } = target.dataset;
        const current = target.dataset.bool === "true";
        foundry.utils.setProperty(this, path, !current);
        await this.render();
      }

      /**
       * Toggles between overview and impacts tabs.
       * @returns {Promise<void>} Promise that resolves when tab is toggled.
       * @static
       */
      static async _onToggleImpacts() {
        this._tab = this._tab === "impacts" ? "overview" : "impacts";
        await this.render();
      }

      /**
       * Unlink a macro from this document.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       * @private
       */
      static async _onUnlinkMacro(_event, target) {
        if (this.editable) {
          if (this.document.system.macros) {
            const uuidElement =
              /** @type {HTMLElement} */ target.closest("[data-uuid]");
            const uuid = uuidElement.dataset.uuid;
            await this.document.system.unlinkMacro(uuid);
          } else {
            ui.notifications.warn("Sheet must be editable to unlink macro.");
          }
        }
      }

      /**
       * Activates the sheet menu functionality.
       * Sets up menu toggle behavior and initial state.
       */
      _activateMenu() {
        /** @type {HTMLElement} */
        const menu = this.element.querySelector(".ab-menu");
        /** @type {HTMLElement} */
        const toggle = this.element.querySelector(".ab-menu-toggle");

        if (menu && this._menuOpen) {
          menu.classList.add("no-transition", "ab-menu-open");
          //eslint-disable-next-line @typescript-eslint/no-unused-expressions
          menu.offsetHeight;
          menu.classList.remove("no-transition");
          toggle.classList.add("ab-menu-toggle-open");
        }

        this._connect(".ab-menu-toggle", "click", () => {
          this._menuOpen = !this._menuOpen;
          menu.classList.toggle("ab-menu-open", this._menuOpen);
          toggle.classList.toggle("ab-menu-toggle-open", this._menuOpen);
        });
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
       * Connects input elements with automatic updates.
       * @param {HTMLElement} element - The input element to connect.
       * @param {string} attribute - The attribute path to update.
       * @param {Function} transformer - Function to transform the input value.
       */
      _connectInput(element, attribute, transformer) {
        const update = (e) => {
          const newValue = transformer(e.currentTarget.value);
          this.item.update({ [attribute]: newValue });
        };
        ["focusout", "change"].forEach((evt) =>
          element.addEventListener(evt, update),
        );
        element.addEventListener("keyup", (e) => {
          if (e.key === "Enter") {
            update(e);
          }
        });
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
        if (typeof this.editable !== "boolean") {
          this.editable = this.isEditable;
        }
        await _connectEmbedded(this.document, this.element, this.editable);
        this._connect("[data-debug]", "contextmenu", () => {
          if (game.settings.get("teriock", "developerMode")) {
            console.log("Debug", this.document, this);
          }
        });
        this._activateMenu();
        _setupEventListeners(this);

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
          editable: this.editable,
          enriched: {},
          fields: this.document.schema.fields,
          flags: this.document.flags,
          id: this.document.id,
          img: this.document.img,
          impactTab: this._impactTab,
          isEditable: this.isEditable,
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
          tab: this._tab,
          uuid: this.document.uuid,
        });
        await this._prepareMacroContext(context);
        return context;
      }

      /**
       * Prepare any macros that should be part of the context.
       * @param {object} context
       * @returns {Promise<void>}
       * @private
       */
      async _prepareMacroContext(context) {
        if (this.document.system.macros) {
          context.macros = await Promise.all(
            Array.from(
              this.document.system.macros.map(async (uuid) => {
                let macro = await fromUuid(uuid);
                if (!macro) {
                  macro = {
                    name: "Broken Macro",
                    uuid: uuid,
                    img: "icons/svg/hazard.svg",
                  };
                }
                return macro;
              }),
            ),
          );
        } else {
          context.macros = [];
        }
      }

      /** @inheritDoc */
      async _renderFrame(options = {}) {
        const frame = await super._renderFrame(options);
        if (this.document.inCompendium) {
          this.window.header.style.backgroundColor =
            "var(--compendium-sheet-header-background-color)";
        }
        if (game.user.isGM) {
          const notesButton = document.createElement("button");
          notesButton.classList.add(
            ...["header-control", "icon", "fa-solid", "fa-notes"],
          );
          notesButton.setAttribute("data-action", "gmNotesOpen");
          notesButton.setAttribute("data-tooltip", "Open GM Notes");
          this.window.controls.before(notesButton);
        }
        return frame;
      }
    }
  );
}
