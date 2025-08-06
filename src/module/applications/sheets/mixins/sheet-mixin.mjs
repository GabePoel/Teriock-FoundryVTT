import connectEmbedded from "../../../helpers/connect-embedded.mjs";
import * as createEffects from "../../../helpers/create-effects.mjs";
import { buildMessage } from "../../../helpers/messages-builder/message-builder.mjs";
import { selectPropertyDialog } from "../../dialogs/select-dialog.mjs";
import { imageContextMenuOptions } from "../misc-sheets/image-sheet/connections/_context-menus.mjs";

const { DragDrop, TextEditor, ContextMenu } = foundry.applications.ux;
const { DocumentSheetV2 } = foundry.applications.api;

/**
 * Base sheet mixin for Teriock system applications.
 * Provides common functionality for all Teriock sheets including event handling,
 * drag and drop, context menus, and form management.
 *
 * @param {DocumentSheetV2} Base - The base application class to mix in with.
 * @returns {DocumentSheetV2 & *}
 */
export default (Base) => {
  return class TeriockSheet extends Base {
    /**
     * Default options for Teriock sheets.
     *
     * @type {object}
     */
    static DEFAULT_OPTIONS = {
      classes: ["teriock", "ability"],
      actions: {
        debug: this._debug,
        editImage: this._editImage,
        openDoc: this._openDoc,
        rollDoc: this._rollDoc,
        chatDoc: this._chatDoc,
        chatThis: this._chatThis,
        rollThis: this._rollThis,
        reloadThis: this._reloadThis,
        toggleLockThis: this._toggleLockThis,
        wikiPullThis: this._wikiPullThis,
        wikiOpenThis: this._wikiOpenThis,
        toggleDisabledDoc: this._toggleDisabledDoc,
        quickToggle: this._quickToggle,
        sheetToggle: this._sheetToggle,
        useOneDoc: this._useOneDoc,
        createAbility: this._createAbility,
        createResource: this._createResource,
        createProperty: this._createProperty,
        createFluency: this._createFluency,
        createBaseEffect: this._createBaseEffect,
      },
      form: { submitOnChange: true, closeOnSubmit: false },
      window: { resizable: true },
      position: { width: 560, height: 600 },
      dragDrop: [{ dragSelector: ".draggable", dropSelector: null }],
    };

    /** @type {DragDrop[]} */
    #dragDrop;

    /**
     * Creates a new Teriock sheet instance.
     * Initializes sheet state including menu state, context menus, and settings.
     *
     * @param {...any} args - Arguments to pass to the base constructor.
     */
    constructor(...args) {
      super(...args);
      this._menuOpen = false;
      this._contextMenus = [];
      this._locked = true;
      this.settings = {};
      this.#dragDrop = this.#createDragDropHandlers();
    }

    /**
     * Gets the drag and drop handlers for this sheet.
     *
     * @returns {DragDrop[]} Array of drag and drop handlers.
     */
    get dragDrop() {
      return this.#dragDrop;
    }

    /**
     * Debug action for development purposes.
     *
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} _target - The target element.
     * @returns {Promise<void>} Promise that resolves when debug is complete.
     */
    static async _debug(_event, _target) {
      console.log("Debug", this.document, this);
    }

    /**
     * Pulls data from wiki for the current document.
     *
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} _target - The target element.
     * @returns {Promise<void>} Promise that resolves when wiki pull is complete.
     */
    static async _wikiPullThis(_event, _target) {
      if (this.editable) this.document.system.wikiPull();
    }

    /**
     * Opens the wiki page for the current document.
     *
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} _target - The target element.
     * @returns {Promise<void>} Promise that resolves when wiki page is opened.
     */
    static async _wikiOpenThis(_event, _target) {
      this.document.system.wikiOpen();
    }

    /**
     * Sends the current document to chat.
     *
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} _target - The target element.
     * @returns {Promise<void>} Promise that resolves when chat is sent.
     */
    static async _chatThis(_event, _target) {
      this.document.chat();
    }

    /**
     * Reloads the current document and re-renders the sheet.
     *
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} _target - The target element.
     * @returns {Promise<void>} Promise that resolves when reload is complete.
     */
    static async _reloadThis(_event, _target) {
      await this.document.update({});
      await this.document.sheet.render();
    }

    /**
     * Toggles the lock state of the current sheet.
     *
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} _target - The target element.
     * @returns {Promise<void>} Promise that resolves when lock is toggled.
     */
    static async _toggleLockThis(_event, _target) {
      this._locked = !this._locked;
      this.editable = this.isEditable && !this._locked;
      this.render();
    }

    /**
     * Rolls the current document with optional advantage/disadvantage.
     *
     * @param {MouseEvent} event - The event object.
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
     * Opens image picker for editing document images.
     *
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<FilePicker>} Promise that resolves when image picker is opened.
     */
    static async _editImage(_event, target) {
      const attr = target.dataset.edit;
      const current = foundry.utils.getProperty(this.document, attr);
      const defaultImg = this.document.constructor.getDefaultArtwork?.(
        this.document.toObject(),
      )?.img;

      /** @type {*} */
      const options = {
        current,
        type: "image",
        redirectToRoot: defaultImg ? [defaultImg] : [],
        callback: (path) => this.document.update({ [attr]: path }),
        top: this.position.top + 40,
        left: this.position.left + 10,
      };

      return /** @type {FilePicker} */ new foundry.applications.apps.FilePicker(
        options,
      ).browse();
    }

    /**
     * Opens the sheet for an embedded document.
     *
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when sheet is opened.
     */
    static async _openDoc(_event, target) {
      const embedded = await this._embeddedFromCard(target);
      embedded?.sheet.render(true);
    }

    /**
     * Sends an embedded document to chat.
     *
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when chat is sent.
     */
    static async _chatDoc(_event, target) {
      const embedded = await this._embeddedFromCard(target);
      await embedded?.chat();
    }

    /**
     * Uses one unit of an embedded consumable document.
     *
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when use is complete.
     */
    static async _useOneDoc(_event, target) {
      const embedded = await this._embeddedFromCard(target);
      await embedded?.system.useOne();
    }

    /**
     * Toggles the disabled state of an embedded document.
     *
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when toggle is complete.
     */
    static async _toggleDisabledDoc(_event, target) {
      const embedded = await this._embeddedFromCard(target);
      await embedded?.toggleDisabled();
    }

    /**
     * Rolls an embedded document with optional advantage/disadvantage.
     *
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when roll is complete.
     */
    static async _rollDoc(event, target) {
      const options = event?.altKey
        ? { advantage: true }
        : event?.shiftKey
          ? { disadvantage: true }
          : {};
      const embedded = await this._embeddedFromCard(target);
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
     * Toggles a boolean field on the current document.
     *
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when toggle is complete.
     */
    static async _quickToggle(_event, target) {
      const { path } = target.dataset;
      const current = target.dataset.bool === "true";
      await this.document.update({ [path]: !current });
    }

    /**
     * Toggles a boolean field on the sheet and re-renders.
     *
     * @param {MouseEvent} _event - The event object.
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
     * Creates a new ability for the current document.
     *
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} _target - The target element.
     * @returns {Promise<ActiveEffect>} Promise that resolves to the created ability.
     */
    static async _createAbility(_event, _target) {
      // const abilityKey = await selectAbilityDialog();
      // console.log(abilityKey);
      // if (abilityKey) {
      //   return await createEffects.importAbility(
      //     this.document,
      //     abilities[abilityKey],
      //   );
      // } else {
      //   return await createEffects.createAbility(this.document);
      // }
      return await createEffects.createAbility(this.document);
    }

    /**
     * Creates a new resource for the current document.
     *
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} _target - The target element.
     * @returns {Promise<ActiveEffect>} Promise that resolves to the created resource.
     */
    static async _createResource(_event, _target) {
      return await createEffects.createResource(this.document);
    }

    /**
     * Creates new fluency for the current document.
     *
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} _target - The target element.
     * @returns {Promise<ActiveEffect>} Promise that resolves to the created fluency.
     */
    static async _createFluency(_event, _target) {
      return await createEffects.createFluency(this.document);
    }

    /**
     * Creates a new base effect for the current document.
     *
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} _target - The target element.
     * @returns {Promise<ActiveEffect>} Promise that resolves to the created fluency.
     */
    static async _createBaseEffect(_event, _target) {
      return await createEffects.createBaseEffect(this.document);
    }

    /**
     * Creates a new property for the current document.
     * Shows a dialog to select a property type or create a new one.
     *
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} _target - The target element.
     * @returns {Promise<ActiveEffect>} Promise that resolves to the created property.
     */
    static async _createProperty(_event, _target) {
      const propertyKey = await selectPropertyDialog();
      let propertyName = "New Property";
      if (propertyKey) {
        propertyName = CONFIG.TERIOCK.properties[propertyKey];
        await game.teriock.api.utils.importProperty(
          this.document,
          propertyName,
        );
      } else {
        await createEffects.createProperty(this.document, propertyName);
      }
    }

    /**
     * Handles the render event for the sheet.
     * Sets up editable state, connects embedded documents, and initializes UI components.
     *
     * @param {object} context - The render context.
     * @param {object} options - Render options.
     * @override
     */
    async _onRender(context, options) {
      await super._onRender(context, options);
      this.editable = this.isEditable && !this._locked;
      connectEmbedded(this.document, this.element, this.editable);

      new ContextMenu(this.element, ".timage", imageContextMenuOptions, {
        eventName: "contextmenu",
        jQuery: false,
        fixed: true,
      });

      this._connect(".chat-button", "contextmenu", (e) => {
        TeriockSheet._debug.call(this, e, e.currentTarget);
      });

      this.#dragDrop.forEach((d) => d.bind(this.element));

      this._activateMenu();
      this._setupEventListeners();

      for (const /** @type {HTMLElement} */ element of this.element.querySelectorAll(
        ".tcard",
      )) {
        const embedded =
          /** @type {TeriockItem|TeriockEffect} */ await this._embeddedFromCard(
            element,
          );
        if (embedded && embedded.type === "condition") {
          const messageParts = {
            image: embedded.img,
            name: embedded.name,
            bars: [],
            blocks: [
              {
                title: "Description",
                text: embedded.system.description,
              },
            ],
          };
          if (embedded.id === "lighted") {
            let lightedToText = "<ul>";
            for (const uuid of this.document.system.lightedTo) {
              const token = await game.teriock.api.utils.fromUuid(uuid);
              lightedToText += `<li>@UUID[${uuid}]{${token.name}}</li>`;
            }
            lightedToText += "</ul>";
            messageParts.blocks.push({
              title: "Lighted to",
              text: lightedToText,
            });
          }
          if (embedded.id === "goaded") {
            let goadedToText = "<ul>";
            for (const uuid of this.document.system.goadedTo) {
              const token = await game.teriock.api.utils.fromUuid(uuid);
              goadedToText += `<li>@UUID[${uuid}]{${token.name}}</li>`;
            }
            goadedToText += "</ul>";
            messageParts.blocks.push({
              title: "Goaded to",
              text: goadedToText,
            });
          }
          const rawMessage = buildMessage(messageParts);
          element.dataset.tooltipHtml = await TextEditor.enrichHTML(
            rawMessage.outerHTML,
          );
          element.dataset.tooltipClass = "teriock teriock-rich-tooltip";
        } else if (embedded && typeof embedded.buildMessage === "function") {
          element.dataset.tooltipHtml = await embedded.buildMessage();
          element.dataset.tooltipClass = "teriock teriock-rich-tooltip";
        }
      }

      this.element.querySelectorAll(".tcard-container").forEach((element) => {
        element.addEventListener(
          "pointerenter",
          async function () {
            await this._richTooltipContainer(element);
          }.bind(this),
        );
      });
    }

    /**
     * Sets up all event listeners for the sheet.
     * Configures handlers for form updates, record fields, set fields, array fields, and changes.
     */
    _setupEventListeners() {
      // Sheet select handler
      this._connect('[data-action="sheetSelect"]', "change", (e) => {
        const { path } = e.currentTarget.dataset;
        if (path) {
          foundry.utils.setProperty(this, path, e.currentTarget.value);
          this.render();
        }
      });

      // Generic update handlers
      this._setupUpdateHandlers();
      this._setupRecordFieldHandlers();
      this._setupSetFieldHandlers();
      this._setupArrayFieldHandlers();
      this._setupChangeHandlers();
    }

    /**
     * Sets up update handlers for various input types.
     * Configures change and click handlers for update inputs, selects, and checkboxes.
     */
    _setupUpdateHandlers() {
      const handlers = [
        { selector: ".teriock-update-input", event: "change" },
        { selector: ".teriock-update-select", event: "change" },
        {
          selector: ".teriock-update-checkbox",
          event: "click",
          getValue: (el) => el.checked,
        },
      ];

      handlers.forEach(({ selector, event, getValue }) => {
        this.element.querySelectorAll(selector).forEach((el) => {
          const name = el.getAttribute("name");
          if (!name) return;

          el.addEventListener(event, async (e) => {
            if (event === "click") e.preventDefault();

            const value = getValue
              ? getValue(e.currentTarget)
              : (e.currentTarget.value ??
                e.currentTarget.getAttribute("data-value"));

            await this.document.update({ [name]: value });
          });
        });
      });
    }

    /**
     * Sets up handlers for record field components.
     * Configures multi-select inputs and remove buttons for record fields.
     */
    _setupRecordFieldHandlers() {
      this.element
        .querySelectorAll(".teriock-record-field")
        .forEach((container) => {
          const select = container.querySelector("select");
          if (!select) return;

          const name = container.getAttribute("name");
          const allowedKeys = Array.from(select.options)
            .map((option) => option.value)
            .filter((value) => value !== "");

          select.addEventListener("input", async () => {
            await this.#addToRecordField(name, select.value, allowedKeys);
          });

          container.querySelectorAll(".remove").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const key = e.currentTarget.closest(".tag").dataset.key;
              await this.#cleanRecordField(
                name,
                allowedKeys.filter((k) => k !== key),
              );
            });
          });
        });
    }

    /**
     * Sets up handlers for set field components.
     * Configures multi-select inputs and remove buttons for set fields.
     */
    _setupSetFieldHandlers() {
      this.element
        .querySelectorAll(".teriock-update-set")
        .forEach((container) => {
          const select = container.querySelector("select");
          if (!select) return;

          const name = container.getAttribute("name");
          const getValues = () =>
            Array.from(select.parentElement.querySelectorAll(".tag")).map(
              (tag) => tag.dataset.key,
            );

          select.addEventListener("input", async () => {
            const values = getValues();
            const selectedValue = select.value;
            if (selectedValue && !values.includes(selectedValue)) {
              values.push(selectedValue);
            }
            await this.#updateSetField(name, values);
          });

          container.querySelectorAll(".remove").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const key = e.currentTarget.closest(".tag").dataset.key;
              const values = getValues().filter((k) => k !== key);
              await this.#updateSetField(name, values);
            });
          });
        });
    }

    // Static Actions

    /**
     * Sets up handlers for array field components.
     * Configures add buttons for array fields.
     */
    _setupArrayFieldHandlers() {
      this.element
        .querySelectorAll(".teriock-array-field-add")
        .forEach((button) => {
          button.addEventListener("click", async (e) => {
            e.preventDefault();
            await this.#addToArrayField(
              button.getAttribute("name"),
              button.dataset.path,
            );
          });
        });
    }

    /**
     * Sets up handlers for change field components.
     * Configures change inputs and remove buttons for change arrays.
     */
    _setupChangeHandlers() {
      // Change inputs
      this.element.querySelectorAll(".teriock-change-input").forEach((el) => {
        const { name } = el.attributes;
        const { index, part } = el.dataset;
        if (!name?.value) return;

        el.addEventListener("change", async (e) => {
          const existing = foundry.utils.getProperty(this.document, name.value);
          const copy = foundry.utils.deepClone(existing) || [];
          copy[index][part] = e.currentTarget.value;
          await this.document.update({ [name.value]: copy });
        });
      });

      // Remove change buttons
      this.element
        .querySelectorAll(".teriock-remove-change-button")
        .forEach((button) => {
          const { name } = button.attributes;
          const { index } = button.dataset;

          button.addEventListener("click", async () => {
            const existing = foundry.utils.getProperty(
              this.document,
              name.value,
            );
            const copy = foundry.utils.deepClone(existing) || [];
            copy.splice(index, 1);
            await this.document.update({ [name.value]: copy });
          });
        });
    }

    /**
     * Prepares the context data for template rendering.
     * Provides common data including config, editable state, document info, and settings.
     *
     * @returns {Promise<object>} Promise that resolves to the context object.
     * @override
     */
    async _prepareContext() {
      return {
        config: CONFIG.TERIOCK,
        editable: this.editable,
        isEditable: this.isEditable,
        isGm: game.user.isGM,
        document: this.document,
        limited: this.document.limited,
        owner: this.document.isOwner,
        fields: this.document.schema.fields,
        system: this.document.system,
        systemFields: this.document.system.schema.fields,
        name: this.document.name,
        img: this.document.img,
        flags: this.document.flags,
        uuid: this.document.uuid,
        id: this.document.id,
        settings: this.settings,
      };
    }

    /**
     * Enriches HTML content for display.
     *
     * @param {string} parameter - The HTML content to enrich.
     * @returns {Promise<string|undefined>} Promise that resolves to the enriched HTML or undefined.
     */
    async _editor(parameter) {
      return parameter?.length
        ? await TextEditor.enrichHTML(parameter, { relativeTo: this.document })
        : undefined;
    }

    /**
     * Activates the sheet menu functionality.
     * Sets up menu toggle behavior and initial state.
     */
    _activateMenu() {
      const menu = this.element.querySelector(".ab-menu");
      const toggle = this.element.querySelector(".ab-menu-toggle");

      if (menu && this._menuOpen) {
        menu.classList.add("no-transition", "ab-menu-open");
        menu.offsetHeight;
        menu.classList.remove("no-transition");
        toggle?.classList.add("ab-menu-toggle-open");
      }

      this._connect(".ab-menu-toggle", "click", () => {
        this._menuOpen = !this._menuOpen;
        menu?.classList.toggle("ab-menu-open", this._menuOpen);
        toggle?.classList.toggle("ab-menu-toggle-open", this._menuOpen);
      });
    }

    /**
     * Connects event handlers to elements matching a selector.
     *
     * @param {string} selector - The CSS selector for elements to connect.
     * @param {string} eventType - The event type to listen for.
     * @param {Function} handler - The event handler function.
     * @private
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
     * Connects input elements with automatic updates.
     *
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
        if (e.key === "Enter") update(e);
      });
    }

    /**
     * Connects button elements to document updates.
     *
     * @param {object} map - Object mapping selectors to attribute paths.
     */
    _connectButtonMap(map) {
      const container = this.element;
      for (const [selector, path] of Object.entries(map)) {
        const elements = container.querySelectorAll(selector);
        elements.forEach((el) => {
          el.addEventListener("click", (e) => {
            e.preventDefault();
            this.document.update({ [path]: "Insert effect here." });
          });
        });
      }
    }

    /**
     * Creates a context menu for elements.
     *
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
     * Extracts an embedded document from a card element.
     *
     * @param {HTMLElement} target - The target element to extract from.
     * @returns {Promise<ClientDocument|null>} The embedded document or null if not found.
     */
    async _embeddedFromCard(target) {
      /** @type {HTMLElement} */
      const card = target.closest(".tcard");
      const { id, type, parentId } = card?.dataset ?? {};

      if (type === "noneMacro") {
        foundry.ui.notifications.warn("Drag a macro onto sheet to assign it.", {
          console: false,
        });
      }

      if (type === "macro") return game.teriock.api.utils.fromUuid(id);

      if (type === "item") return this.document.items.get(id);

      if (["effect", "conditionUnlocked"].includes(type)) {
        if (
          this.document.documentName === "Actor" &&
          this.document._id !== parentId
        ) {
          return this.document.items.get(parentId)?.effects.get(id);
        }
        if (this.document.documentName === "ActiveEffect") {
          return this.document.parent?.effects.get(id);
        }
        return this.document.effects.get(id);
      }

      if (type === "conditionLocked") {
        return CONFIG.TERIOCK.content.conditions[id];
      }
    }

    /**
     * Assigns overall rules to tooltips of tcard containers.
     *
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    async _richTooltipContainer(target) {
      const rect = target.getBoundingClientRect();
      const leftSpace = rect.left;
      const rightSpace = window.innerWidth - rect.right;

      // Determine tooltip direction
      if (rightSpace >= 350) {
        target.dataset.tooltipDirection = "RIGHT";
      } else {
        target.dataset.tooltipDirection =
          leftSpace > rightSpace ? "LEFT" : "RIGHT";
      }
    }

    /**
     * Handles drag start events for embedded documents.
     *
     * @param {DragEvent} event - The drag start event.
     * @private
     */
    async _onDragStart(event) {
      const embedded = await this._embeddedFromCard(event.currentTarget);
      const dragData = embedded?.toDragData();
      if (dragData) {
        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
      }
    }

    /**
     * Handles drag over events.
     *
     * @param {DragEvent} _event - The drag over event.
     * @private
     */
    _onDragOver(_event) {
      // TODO: Provide visual feedback.
    }

    /**
     * Handles drop events for documents.
     *
     * @param {DragEvent} event - The drop event.
     * @returns {Promise<boolean>} Promise that resolves to true if drop was handled.
     * @private
     */
    async _onDrop(event) {
      const document = await TextEditor.getDragEventData(event);
      if (document.type === "ActiveEffect") {
        await this._onDropActiveEffect(event, document);
      } else if (document.type === "Item") {
        await this._onDropItem(event, document);
      } else if (document.type === "Macro") {
        await this._onDropMacro(event, document);
      }
      return true;
    }

    /**
     * Handles dropping of active effects.
     *
     * @param {DragEvent} _event - The drop event.
     * @param {object} data - The effect data.
     * @returns {Promise<boolean>} Promise that resolves to true if drop was successful.
     * @private
     */
    async _onDropActiveEffect(_event, data) {
      /** @type {typeof ClientDocument} */
      const EffectClass = await getDocumentClass("ActiveEffect");
      const effect =
        /** @type {TeriockEffect} */ await EffectClass.fromDropData(data);
      if (!this._canDropEffect(effect)) return false;

      if (this.document.documentName === "ActiveEffect") {
        effect.updateSource({ "system.hierarchy.supId": this.document.id });
      }
      const target =
        this.document.documentName === "ActiveEffect"
          ? this.document.parent
          : this.document;
      const newEffects = await target.createEmbeddedDocuments("ActiveEffect", [
        effect,
      ]);
      const newEffect = newEffects[0];
      if (this.document.documentName === "ActiveEffect") {
        await this.document.addSub(newEffect);
      }
      return newEffect;
    }

    /**
     * Checks if an effect can be dropped on this document.
     *
     * @param {TeriockEffect} effect - The effect to check.
     * @returns {boolean} True if the effect can be dropped.
     * @private
     */
    _canDropEffect(effect) {
      return (
        this.document.isOwner &&
        effect &&
        effect.parent !== this.document &&
        effect.target !== this.document &&
        effect !== this.document &&
        (["Actor", "Item"].includes(this.document.documentName) ||
          (this.document.metadata.canSub && effect.metadata.canSub))
      );
    }

    /**
     * Handles dropping of items.
     *
     * @param {DragEvent} _event - The drop event.
     * @param {object} data - The item data.
     * @returns {Promise<TeriockItem|boolean>} Promise that resolves to true if drop was successful.
     * @private
     */
    async _onDropItem(_event, data) {
      /** @type {typeof ClientDocument} */
      const ItemClass = await getDocumentClass("Item");
      const item =
        /** @type {TeriockItem} */ await ItemClass.fromDropData(data);
      if (!this._canDropItem(item)) return false;

      const source = await game.teriock.api.utils.fromUuid(data.uuid);
      if (item.parent?.documentName === "Actor" && item.type === "equipment") {
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
      const newItems = await this.document.createEmbeddedDocuments(
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
     * Checks if an item can be dropped on this document.
     *
     * @param {TeriockItem} item - The item to check.
     * @returns {boolean} True if the item can be dropped.
     * @private
     */
    _canDropItem(item) {
      return (
        this.document.isOwner &&
        item &&
        item.parent !== this.document &&
        this.document.documentName === "Actor"
      );
    }

    /**
     * Handles dropping of a macro on this document.
     *
     * @param {DragEvent} _event - The drop event.
     * @param {object} _data - The macro data.
     * @returns {Promise<TeriockMacro|void>} Promise that resolves to the dropped macro if successful.
     * @private
     */
    async _onDropMacro(_event, _data) {}

    /**
     * Checks if drag start is allowed.
     *
     * @returns {boolean} True if drag start is allowed.
     */
    _canDragStart() {
      return this.editable;
    }

    /**
     * Checks if drag drop is allowed.
     *
     * @returns {boolean} True if drag drop is allowed.
     */
    _canDragDrop() {
      return this.editable;
    }

    // Private helper methods

    /**
     * Creates drag and drop handlers for the sheet.
     *
     * @returns {DragDrop[]} Array of configured drag and drop handlers.
     * @private
     */
    #createDragDropHandlers() {
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
     * Adds a key to a record field with validation.
     *
     * @param {string} name - The field name.
     * @param {string} key - The key to add.
     * @param {Array} allowedKeys - Array of allowed keys.
     * @returns {Promise<void>} Promise that resolves when the field is updated.
     * @private
     */
    async #addToRecordField(name, key, allowedKeys = []) {
      const existing = foundry.utils.getProperty(this.document, name);
      const copy = foundry.utils.deepClone(existing) || {};
      const updateData = {};

      // Remove invalid keys
      Object.keys(copy).forEach((k) => {
        if (k !== key && !allowedKeys.includes(k)) {
          updateData[`${name}.-=${k}`] = null;
        }
      });

      updateData[`${name}.${key}`] = null;
      await this.document.update(updateData);
    }

    /**
     * Cleans a record field by removing invalid keys.
     *
     * @param {string} name - The field name.
     * @param {Array} allowedKeys - Array of allowed keys to keep.
     * @returns {Promise<void>} Promise that resolves when the field is cleaned.
     * @private
     */
    async #cleanRecordField(name, allowedKeys = []) {
      const existing = foundry.utils.getProperty(this.document, name);
      const copy = foundry.utils.deepClone(existing) || {};
      const updateData = {};

      Object.keys(copy).forEach((k) => {
        if (!allowedKeys.includes(k)) {
          updateData[`${name}.-=${k}`] = null;
        }
      });

      await this.document.update(updateData);
    }

    /**
     * Adds an item to an array field.
     *
     * @param {string} name - The field name.
     * @param {string} fieldPath - The path to the field schema.
     * @returns {Promise<void>} Promise that resolves when the item is added.
     * @private
     */
    async #addToArrayField(name, fieldPath) {
      const cleanFieldPath = fieldPath.startsWith("system.")
        ? fieldPath.slice(7)
        : fieldPath;
      const copy =
        foundry.utils.deepClone(
          foundry.utils.getProperty(this.document, name),
        ) || [];
      const field =
        this.document.system.schema.getField(cleanFieldPath).element;
      const initial = field.getInitialValue();

      copy.push(initial);
      await this.document.update({ [name]: copy });
    }

    /**
     * Updates a set field with new values.
     *
     * @param {string} name - The field name.
     * @param {Array} values - Array of values for the set.
     * @returns {Promise<void>} Promise that resolves when the set is updated.
     * @private
     */
    async #updateSetField(name, values = []) {
      await this.document.update({ [name]: new Set(values) });
    }
  };
};
