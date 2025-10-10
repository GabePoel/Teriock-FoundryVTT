import * as createEffects from "../../../../helpers/create-effects.mjs";
import { TeriockDialog } from "../../../api/_module.mjs";
import {
  selectAbilityDialog,
  selectPropertyDialog,
  selectTradecraftDialog,
} from "../../../dialogs/select-dialog.mjs";
import { RichApplicationMixin } from "../../../shared/mixins/_module.mjs";
import { TeriockTextEditor } from "../../../ux/_module.mjs";
import _connectEmbedded from "./methods/_connect-embedded.mjs";
import _embeddedFromCard from "./methods/_embedded-from-card.mjs";
import _setupEventListeners from "./methods/_setup-handlers.mjs";

const { ContextMenu, DragDrop } = foundry.applications.ux;
const {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  DocumentSheetV2,
} = foundry.applications.api;
const TextEditor = foundry.applications.ux.TextEditor.implementation;

/**
 * Base sheet mixin for Teriock system applications.
 * Provides common functionality for all Teriock sheets including event handling,
 * drag and drop, context menus, and form management.
 * @param {typeof DocumentSheetV2} Base - The base application class to mix in with.
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {CommonSheetMixinInterface}
     * @extends {DocumentSheetV2}
     * @param {TeriockActor|TeriockItem|TeriockEffect} document
     */
    class CommonSheetMixin extends RichApplicationMixin(Base) {
      //noinspection JSValidateTypes
      /**
       * Default sheet options.
       * @type {Partial<ApplicationConfiguration & { dragDrop: object[] }>}
       */
      static DEFAULT_OPTIONS = {
        actions: {
          changeImpactTab: this._changeImpactTab,
          chatDoc: this._chatDoc,
          chatThis: this._chatThis,
          createAbility: this._createAbility,
          createBaseEffect: this._createBaseEffect,
          createFluency: this._createFluency,
          createProperty: this._createProperty,
          createResource: this._createResource,
          debug: this._debug,
          editImage: this._editImage,
          openDoc: this._openDoc,
          quickToggle: this._quickToggle,
          refreshIndexThisHard: this._refreshIndexThisHard,
          refreshIndexThisSoft: this._refreshIndexThisSoft,
          reloadThis: this._reloadThis,
          rollDoc: this._rollDoc,
          rollThis: this._rollThis,
          sheetToggle: this._sheetToggle,
          toggleDisabledDoc: this._toggleDisabledDoc,
          toggleImpacts: this._toggleImpacts,
          toggleLockThis: this._toggleLockThis,
          unlinkMacro: this._unlinkMacro,
          useOneDoc: this._useOneDoc,
          wikiOpenThis: this._wikiOpenThis,
          wikiPullThis: this._wikiPullThis,
          gmNotesOpen: this._gmNotesOpen,
        },
        classes: ["teriock", "ability"],
        dragDrop: [
          {
            dragSelector: ".draggable",
            dropSelector: null,
          },
        ],
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
          controls: [
            {
              icon: "fa-solid fa-rotate-right",
              label: "Reload Sheet",
              action: "reloadThis",
            },
            {
              icon: "fa-solid fa-book-atlas",
              label: "Soft Index Refresh",
              action: "refreshIndexThisSoft",
            },
            {
              icon: "fa-solid fa-book-copy",
              label: "Hard Index Refresh",
              action: "refreshIndexThisHard",
            },
          ],
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
        this.#dragDrop = this.#createDragDropHandlers();
        this._impactTab = "base";
        this._locked = true;
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
      static async _changeImpactTab(_event, target) {
        this._impactTab = target.dataset.tab;
        this.render();
      }

      /**
       * Sends an embedded document to chat.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when chat is sent.
       */
      static async _chatDoc(_event, target) {
        const embedded = await _embeddedFromCard(this, target);
        await embedded?.toMessage();
      }

      /**
       * Sends the current document to chat.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves when chat is sent.
       */
      static async _chatThis(_event, _target) {
        this.document.toMessage();
      }

      /**
       * Creates a new ability for the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves to the created ability.
       */
      static async _createAbility(_event, _target) {
        const abilityKey = await selectAbilityDialog();
        let abilityName = "New Ability";
        if (abilityKey) {
          if (abilityKey !== "other") {
            abilityName = TERIOCK.index.abilities[abilityKey];
            await tm.fetch.importAbility(this.document, abilityName);
          } else {
            await createEffects.createAbility(this.document, abilityName);
          }
        }
      }

      /**
       * Creates a new base effect for the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves to the created fluency.
       */
      static async _createBaseEffect(_event, _target) {
        await createEffects.createBaseEffect(this.document);
      }

      /**
       * Creates new fluency for the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves to the created fluency.
       */
      static async _createFluency(_event, _target) {
        const tradecraft = await selectTradecraftDialog();
        if (tradecraft) {
          await createEffects.createFluency(this.document, tradecraft);
        }
      }

      /**
       * Creates a new property for the current document.
       * Shows a dialog to select a property type or create a new one.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves to the created property.
       */
      static async _createProperty(_event, _target) {
        const propertyKey = await selectPropertyDialog();
        let propertyName = "New Property";
        if (propertyKey) {
          if (propertyKey !== "other") {
            propertyName = TERIOCK.index.properties[propertyKey];
            await tm.fetch.importProperty(this.document, propertyName);
          } else {
            await createEffects.createProperty(this.document, propertyName);
          }
        }
      }

      /**
       * Creates a new resource for the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves to the created resource.
       */
      static async _createResource(_event, _target) {
        await createEffects.createResource(this.document);
      }

      /**
       * Debug action for development purposes.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves when debug is complete.
       */
      static async _debug(_event, _target) {
        console.log("Debug", this.document, this);
      }

      /**
       * Opens image picker for editing document images.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when image picker is opened.
       */
      static async _editImage(event, target) {
        event.stopPropagation();
        const attr = target.dataset.edit;
        const current = foundry.utils.getProperty(this.document, attr);
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
       * Opens the notes page and makes one if one doesn't already exist.
       * @returns {Promise<void>}
       * @private
       */
      static async _gmNotesOpen() {
        await this.document.system.gmNotesOpen();
      }

      /**
       * Opens the sheet for an embedded document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when the sheet is opened.
       */
      static async _openDoc(_event, target) {
        const embedded = await _embeddedFromCard(this, target);
        await embedded?.sheet.render(true);
      }

      /**
       * Toggles a boolean field on the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when toggle is complete.
       */
      static async _quickToggle(_event, target) {
        const { path } = target.dataset;
        const current = target.dataset.bool === "true";
        await this.document.update({ [path]: !current });
      }

      /**
       * Refresh this document from the index.
       * @returns {Promise<void>}
       */
      static async _refreshIndexThisHard() {
        if (this.editable) {
          const proceed = await TeriockDialog.confirm({
            content:
              "Are you sure you would like to refresh this? It will alter its content and may delete important" +
              " information.",
            modal: true,
            window: { title: "Confirm Hard Refresh" },
          });
          if (proceed) {
            await this.document.system.hardRefreshFromIndex();
          }
          foundry.ui.notifications.success(`Refreshed ${this.document.name}.`);
        } else {
          foundry.ui.notifications.warn(
            `Cannot refresh ${this.document.name}. Sheet is not editable.`,
          );
        }
      }

      /**
       * Refresh this document from the index.
       * @returns {Promise<void>}
       */
      static async _refreshIndexThisSoft() {
        if (this.editable) {
          const proceed = await TeriockDialog.confirm({
            content:
              "Are you sure you would like to refresh this? It will alter its content and may delete important" +
              " information.",
            modal: true,
            window: { title: "Confirm Soft Refresh" },
          });
          if (proceed) {
            await this.document.system.refreshFromIndex();
          }
          foundry.ui.notifications.success(`Refreshed ${this.document.name}.`);
        } else {
          foundry.ui.notifications.warn(
            `Cannot refresh ${this.document.name}. Sheet is not editable.`,
          );
        }
      }

      /**
       * Reloads the current document and re-renders the sheet.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves when reload is complete.
       */
      static async _reloadThis(_event, _target) {
        await this.document.update({});
        await this.document.sheet.render();
      }

      /**
       * Rolls an embedded document with optional advantage/disadvantage.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when roll is complete.
       */
      static async _rollDoc(event, target) {
        const options = event?.altKey
          ? { advantage: true }
          : event?.shiftKey
            ? { disadvantage: true }
            : {};
        if (this.document.documentName === "Actor") {
          options.actor = this.document;
        } else if (this.document.actor) {
          options.actor = this.document.actor;
        }
        const embedded = await _embeddedFromCard(this, target);
        if (embedded?.type === "equipment") {
          if (event?.shiftKey) {
            options.secret = true;
          }
          if (event?.ctrlKey) {
            options.twoHanded = true;
          }
        }
        await embedded?.use(options);
      }

      /**
       * Rolls the current document with optional advantage/disadvantage.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves when roll is complete.
       */
      static async _rollThis(event, _target) {
        const options = event?.altKey
          ? { advantage: true }
          : event?.shiftKey
            ? { disadvantage: true }
            : {};
        this.document.use(options);
      }

      /**
       * Toggles a boolean field on the sheet and re-renders.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when toggle is complete.
       */
      static async _sheetToggle(_event, target) {
        const { path } = target.dataset;
        const current = target.dataset.bool === "true";
        foundry.utils.setProperty(this, path, !current);
        this.render();
      }

      /**
       * Toggles the disabled state of an embedded document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when toggle is complete.
       */
      static async _toggleDisabledDoc(_event, target) {
        if (!this.editable) {
          foundry.ui.notifications.warn(
            `Cannot toggle disabled. Sheet is not editable.`,
          );
          return;
        }
        const embedded = await _embeddedFromCard(this, target);
        await embedded?.toggleDisabled();
      }

      /**
       * Toggles between overview and impacts tabs.
       * @returns {Promise<void>} Promise that resolves when tab is toggled.
       * @static
       */
      static async _toggleImpacts() {
        this._tab = this._tab === "impacts" ? "overview" : "impacts";
        this.render();
      }

      /**
       * Toggles the lock state of the current sheet.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves when lock is toggled.
       */
      static async _toggleLockThis(_event, _target) {
        this._locked = !this._locked;
        this.editable = this.isEditable && !this._locked;
        this.render();
      }

      /**
       * Unlink a macro from this document.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       * @private
       */
      static async _unlinkMacro(_event, target) {
        if (this.editable) {
          if (this.document.system.macros) {
            const uuid = target.dataset.parentId;
            await this.document.system.unlinkMacro(uuid);
          } else {
            foundry.ui.notifications.warn(
              "Sheet must be editable to unlink macro.",
            );
          }
        }
      }

      /**
       * Uses one unit of an embedded consumable document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when use is complete.
       */
      static async _useOneDoc(_event, target) {
        const embedded = await _embeddedFromCard(this, target);
        await embedded?.system.useOne();
      }

      /**
       * Opens the wiki page for the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves when wiki page is opened.
       */
      static async _wikiOpenThis(_event, _target) {
        this.document.system.wikiOpen();
      }

      /**
       * Pulls data from wiki for the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves when wiki pull is complete.
       */
      static async _wikiPullThis(_event, _target) {
        if (this.editable) {
          const proceed = await TeriockDialog.confirm({
            content:
              "Are you sure you would like to pull this from the wiki? It will alter its content and may delete" +
              " important information.",
            modal: true,
            window: { title: "Confirm Wiki Pull" },
          });
          if (proceed) {
            this.document.system.wikiPull();
          }
        } else {
          foundry.ui.notifications.warn(
            `Cannot pull ${this.document.name} from wiki. Sheet is not editable.`,
          );
        }
      }

      /** @type {DragDrop[]} */
      #dragDrop;

      //noinspection JSUnusedGlobalSymbols
      /**
       * Gets the drag and drop handlers for this sheet.
       * @returns {DragDrop[]} Array of drag and drop handlers.
       */
      get dragDrop() {
        return this.#dragDrop;
      }

      /**
       * Creates drag and drop handlers for the sheet.
       * @returns {DragDrop[]} Array of configured drag and drop handlers.
       * @private
       */
      #createDragDropHandlers() {
        //noinspection JSUnresolvedReference
        return this.options.dragDrop.map((config) => {
          config.permissions = {
            dragstart: this._canDragStart.bind(this),
            drop: this._canDragDrop.bind(this),
          };
          config.callbacks = {
            dragstart: this._onDragStart.bind(this),
            dragover: this._onDragOver.bind(this),
            drop: this._onDrop.bind(this),
          };
          return new DragDrop(config);
        });
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
       * Checks if drag and drop is allowed.
       * @returns {boolean} True if drag and drop is allowed.
       */
      _canDragDrop() {
        return this.editable;
      }

      /**
       * Checks if drag start is allowed.
       * @returns {boolean} True if drag start is allowed.
       */
      _canDragStart() {
        return this.editable;
      }

      /**
       * Checks if some other document can be dropped on this document.
       * @param {TeriockItem|TeriockEffect|TeriockMacro} doc - The document to check.
       * @returns {boolean} True if the document can be dropped.
       * @private
       */
      _canDrop(doc) {
        const childTypes = new Set([
          ...this.document.metadata.childEffectTypes,
          ...this.document.metadata.childItemTypes,
          ...this.document.metadata.childMacroTypes,
        ]);
        return (
          this.document.isOwner &&
          doc &&
          doc.parent !== this.document &&
          doc !== this.document &&
          childTypes.has(doc.type)
        );
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
            e.preventDefault();
            handler(e);
          }),
        );
      }

      /**
       * Connects button elements to document updates.
       * @param {object} map - Object mapping selectors to attribute paths.
       */
      _connectButtonMap(map) {
        const container = this.element;
        for (const [selector, path] of Object.entries(map)) {
          const elements = container.querySelectorAll(selector);
          elements.forEach((el) => {
            el.addEventListener("click", async (e) => {
              e.preventDefault();
              await this.document.update({ [path]: "Insert text here." });
            });
          });
        }
      }

      /**
       * Creates a context menu for elements.
       * @param {string} cssClass - The CSS class for elements to attach the menu to.
       * @param {object[]} menuItems - The context menu items.
       * @param {string} eventName - The event name to trigger the menu.
       * @returns {ContextMenu} The created context menu.
       */
      _connectContextMenu(cssClass, menuItems, eventName) {
        return /** @type {ContextMenu} */ new ContextMenu(
          this.element,
          cssClass,
          menuItems,
          {
            eventName,
            jQuery: false,
            fixed: false,
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
          ? await TextEditor.enrichHTML(parameter, {
              relativeTo: this.document,
            })
          : undefined;
      }

      /**
       * Enrich an object of HTML content for display.
       * @param {object} context - Context object to put enrichments into.
       * @param {Promise<Record<string, string>>} obj - Keys and values corresponding to text that needs enrichment.
       * @returns {Promise<void>}
       */
      async _enrichAll(context, obj) {
        if (Object.keys(context).includes("enriched")) {
          for (const [key, value] of Object.entries(obj)) {
            context.enriched[key] = await this._enrich(value);
          }
        }
      }

      /**
       * Handles drag over events.
       * @param {DragEvent} _event - The drag over event.
       * @private
       */
      _onDragOver(_event) {
        // TODO: Provide visual feedback.
      }

      /**
       * Handles drag start events for embedded documents.
       * @param {DragEvent} event - The drag start event.
       * @private
       */
      async _onDragStart(event) {
        const embedded = await _embeddedFromCard(this, event.currentTarget);
        const dragData = embedded?.toDragData();
        if (dragData) {
          event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
        }
      }

      /**
       * Handles drop events for documents.
       * @param {DragEvent} event - The drop event.
       * @returns {Promise<boolean>} Promise that resolves to true if the drop was handled.
       * @private
       */
      async _onDrop(event) {
        const document = await TextEditor.getDragEventData(event);
        console.log(document);
        if (document.type === "ActiveEffect") {
          await this._onDropActiveEffect(event, document);
        } else if (document.type === "Item") {
          await this._onDropItem(event, document);
        } else if (document.type === "Macro") {
          await this._onDropMacro(event, document);
        } else if (document.type === "JournalEntryPage") {
          await this._onDropJournalEntryPage(event, document);
        }
        return true;
      }

      /**
       * Handles dropping of active effects.
       * @param {DragEvent} _event - The drop event.
       * @param {object} data - The effect data.
       * @returns {Promise<TeriockEffect|boolean>} Promise that resolves to true if the drop was successful.
       * @private
       */
      async _onDropActiveEffect(_event, data) {
        /** @type {typeof ClientDocument} */
        const EffectClass =
          await foundry.utils.getDocumentClass("ActiveEffect");
        const effect =
          /** @type {TeriockEffect} */ await EffectClass.fromDropData(data);
        if (!this._canDrop(effect)) {
          return false;
        }

        if (this.document.documentName === "ActiveEffect") {
          effect.updateSource({ "system.hierarchy.supId": this.document.id });
        }
        const target =
          this.document.documentName === "ActiveEffect"
            ? this.document.parent
            : this.document;
        const newEffects =
          /** @type {TeriockEffect[]} */ await target.createEmbeddedDocuments(
            "ActiveEffect",
            [effect],
          );
        const newEffect = newEffects[0];
        if (this.document.documentName === "ActiveEffect") {
          await this.document.addSub(newEffect);
        }
        return newEffect;
      }

      /**
       * Handles dropping of items.
       * @param {DragEvent} _event - The drop event.
       * @param {object} data - The item data.
       * @returns {Promise<TeriockItem|boolean>} Promise that resolves to true if the drop was successful.
       * @private
       */
      async _onDropItem(_event, data) {
        /** @type {typeof ClientDocument} */
        const ItemClass = await foundry.utils.getDocumentClass("Item");
        const item =
          /** @type {TeriockItem} */ await ItemClass.fromDropData(data);
        if (item.type === "wrapper") {
          /** @type {ClientDocument} */
          const effect = item.system.effect;
          await this._onDropActiveEffect(_event, effect.toDragData());
          return false;
        }
        if (!this._canDrop(item)) {
          return false;
        }

        const source = await foundry.utils.fromUuid(data.uuid);
        if (
          item.parent?.documentName === "Actor" &&
          item.type === "equipment"
        ) {
          if (item.parent?.documentName === "Actor" && item.system.consumable) {
            const targetItem = this.document.items.getName(item.name);
            if (targetItem && targetItem.system.consumable) {
              targetItem.update({
                "system.quantity":
                  targetItem.system.quantity + item.system.quantity,
              });
              await source.delete();
              return targetItem;
            }
          }
          if (source) {
            await source.delete();
          }
        }
        const newItems =
          /** @type {TeriockItem[]} */ await this.document.createEmbeddedDocuments(
            "Item",
            [item],
            {
              keepId: true,
              keepEmbeddedIds: true,
            },
          );
        return newItems[0];
      }

      /**
       * Handles dropping of a journal entry page on this document.
       * @param {DragEvent} _event - The drop event.
       * @param {object} data - The macro data.
       * @returns {Promise<TeriockJournalEntryPage|void>} Promise that resolves to the dropped journal entry page if
       *   successful.
       * @private
       */
      async _onDropJournalEntryPage(_event, data) {
        if (game.user.isGM) {
          const updateData = {
            "system.gmNotes": data.uuid,
          };
          await this.document.update(updateData);
          return fromUuidSync(data.uuid);
        }
      }

      /**
       * Handles dropping of a macro on this document.
       * @param {DragEvent} _event - The drop event.
       * @param {object} data - The macro data.
       * @returns {Promise<TeriockMacro|void>} Promise that resolves to the dropped macro if successful.
       * @private
       */
      async _onDropMacro(_event, data) {
        if (this.document.system.macros) {
          const macroUuids = Array.from(this.document.system.macros);
          if (data.uuid) {
            macroUuids.push(data.uuid);
            const updateData = {
              "system.macros": macroUuids,
            };
            await this.document.update(updateData);
          }
        }
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);

        const toggleButton = this.window.header.querySelector(
          "[data-action='toggleLockThis']",
        );
        if (toggleButton) {
          toggleButton.classList.remove(...["fa-lock-open", "fa-lock"]);
          toggleButton.classList.add(
            ...[this.editable ? "fa-lock-open" : "fa-lock"],
          );
          toggleButton.setAttribute(
            "data-tooltip",
            this.editable ? "Unlocked" : "Locked",
          );
        }

        this.editable = this.isEditable && !this._locked;
        _connectEmbedded(this.document, this.element, this.editable);
        this._connect(".chat-button", "contextmenu", (e) => {
          CommonSheetMixin._debug.call(this, e, e.currentTarget);
        });
        this.#dragDrop.forEach((d) => d.bind(this.element));
        this._activateMenu();
        this._connect('[data-action="sheetSelect"]', "change", (e) => {
          const { path } = e.currentTarget.dataset;
          if (path) {
            foundry.utils.setProperty(this, path, e.currentTarget.value);
            this.render();
          }
        });
        _setupEventListeners(this);

        const elements = Array.from(this.element.querySelectorAll(".tcard"));
        const embeddedResults = await Promise.all(
          elements.map((element) => _embeddedFromCard(this, element)),
        );
        const tooltipPromises = embeddedResults.map(async (embedded, index) => {
          const element = elements[index];

          if (!embedded) {
            return;
          }

          if (embedded?.type === "condition") {
            /** @type {Teriock.MessageData.MessagePanel} */
            const messageParts = {
              bars: [],
              blocks: [
                {
                  text: embedded?.description,
                  title: "Description",
                },
              ],
              image: embedded?.img,
              name: embedded?.name,
              associations: [],
              icon: TERIOCK.options.document.condition.icon,
            };

            if (embedded?.id) {
              /** @type {TeriockTokenDocument[]} */
              const tokenDocs = (
                this.document.system.trackers[embedded.id] || []
              ).map((uuid) => fromUuidSync(uuid));
              if (tokenDocs.length > 0) {
                /** @type {Teriock.MessageData.MessageAssociation} */
                const association = {
                  title: "Associated Creatures",
                  icon: TERIOCK.options.document.creature.icon,
                  cards: [],
                };
                for (const tokenDoc of tokenDocs) {
                  association.cards.push({
                    name: tokenDoc.name,
                    uuid: tokenDoc.uuid,
                    img: tokenDoc.texture.src,
                    id: tokenDoc.id,
                    type: "base",
                    rescale: tokenDoc.rescale,
                  });
                }
                messageParts.associations.push(association);
              }
            }
            element.dataset.tooltipHtml =
              await TeriockTextEditor.makeTooltip(messageParts);
            element.dataset.tooltipClass = "teriock teriock-rich-tooltip";
          } else if (typeof embedded?.toTooltip === "function") {
            element.dataset.tooltipHtml = await embedded?.toTooltip();
          }
        });

        await Promise.all(tooltipPromises);

        this.element.querySelectorAll(".tcard-container").forEach((element) => {
          element.addEventListener(
            "pointerenter",
            async function () {
              await this._initRichTooltipOrientation(element);
            }.bind(this),
          );
        });
      }

      /**
       * @inheritDoc
       */
      async _prepareContext(options) {
        const context = await super._prepareContext(options);
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
          isGm: game.user.isGM,
          limited: this.document.limited,
          name: this.document.name,
          owner: this.document.isOwner,
          settings: this.settings,
          system: this.document.system,
          systemFields: this.document.system.schema.fields,
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
                let macro = await foundry.utils.fromUuid(uuid);
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
      async _renderFrame(options) {
        const frame = await super._renderFrame(options);
        if (this.document.inCompendium) {
          this.window.header.style.backgroundColor =
            "var(--compendium-sheet-header-background-color)";
        }
        if (
          this.document.documentName === "Item" ||
          this.document.documentName === "ActiveEffect"
        ) {
          const toggleButton = document.createElement("button");
          toggleButton.classList.add(
            ...[
              "header-control",
              "icon",
              "fa-solid",
              this.editable ? "fa-lock-open" : "fa-lock",
            ],
          );
          toggleButton.setAttribute("data-action", "toggleLockThis");
          toggleButton.setAttribute(
            "data-tooltip",
            this.editable ? "Unlocked" : "Locked",
          );
          if (
            !this.document.isOwner ||
            (this.document.inCompendium && this.document.compendium.locked)
          ) {
            toggleButton.setAttribute("disabled", "disabled");
          }
          this.window.controls.after(toggleButton);
        }
        if (game.user.isGM) {
          const notesButton = document.createElement("button");
          notesButton.classList.add(
            ...[
              "header-control",
              "icon",
              "fa-solid",
              this.editable ? "fa-lock-open" : "fa-notes",
            ],
          );
          notesButton.setAttribute("data-action", "gmNotesOpen");
          notesButton.setAttribute("data-tooltip", "Open GM Notes");
          this.window.controls.after(notesButton);
        }
        return frame;
      }
    }
  );
};
