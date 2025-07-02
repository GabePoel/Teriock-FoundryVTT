const { utils } = foundry;
const { ux, api } = foundry.applications;
import { chatImage } from "../../helpers/utils.mjs";
import { imageContextMenuOptions } from "../misc-sheets/image-sheet/connections/_context-menus.mjs";
import * as createEffects from "../../helpers/create-effects.mjs";
import connectEmbedded from "../../helpers/connect-embedded.mjs";

/**
 * Base sheet mixin for Teriock system applications.
 * Provides common functionality for all Teriock sheets including event handling,
 * drag and drop, context menus, and form management.
 * @template {Function} Base - The base application class constructor to extend.
 * @param {Base} Base - The base application class to mix in with.
 * @returns {Base} The extended application class with Teriock sheet functionality.
 */
export const TeriockSheet = (Base) =>
  class TeriockSheet extends Base {
    /**
     * Default options for Teriock sheets.
     * @type {object}
     * @static
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
        // toggleSwitch: this._toggleSwitch,
      },
      form: { submitOnChange: true, closeOnSubmit: false },
      window: { resizable: true },
      position: { width: 560, height: 600 },
    };

    /**
     * Creates a new Teriock sheet instance.
     * Initializes sheet state including menu state, context menus, and settings.
     * @param {...any} args - Arguments to pass to the base constructor.
     */
    constructor(...args) {
      super(...args);
      this._menuOpen = false;
      this._contextMenus = [];
      this._locked = true;
      this.settings = {};
    }

    /**
     * Handles the render event for the sheet.
     * Sets up editable state, connects embedded documents, and initializes UI components.
     * @param {object} context - The render context.
     * @param {object} options - Render options.
     * @override
     */
    _onRender(context, options) {
      super._onRender(context, options);
      this.editable = this.isEditable && !this._locked;
      connectEmbedded(this.document, this.element, this.editable);

      new ux.ContextMenu(this.element, ".timage", imageContextMenuOptions, {
        eventName: "contextmenu",
        jQuery: false,
        fixed: true,
      });

      this._connect(".chat-button", "contextmenu", (e) => {
        TeriockSheet._debug.call(this, e, e.currentTarget);
      });

      this._activateMenu();
      this._setupEventListeners();
    }

    /**
     * Sets up all event listeners for the sheet.
     * Configures handlers for form updates, record fields, set fields, array fields, and changes.
     * @private
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
     * @private
     */
    _setupUpdateHandlers() {
      const handlers = [
        { selector: ".teriock-update-input", event: "change" },
        { selector: ".teriock-update-select", event: "change" },
        { selector: ".teriock-update-checkbox", event: "click", getValue: (el) => el.checked },
      ];

      handlers.forEach(({ selector, event, getValue }) => {
        this.element.querySelectorAll(selector).forEach((el) => {
          const name = el.getAttribute("name");
          if (!name) return;

          el.addEventListener(event, async (e) => {
            if (event === "click") e.preventDefault();

            const value = getValue
              ? getValue(e.currentTarget)
              : (e.currentTarget.value ?? e.currentTarget.getAttribute("data-value"));

            await this.document.update({ [name]: value });
          });
        });
      });
    }

    /**
     * Sets up handlers for record field components.
     * Configures multi-select inputs and remove buttons for record fields.
     * @private
     */
    _setupRecordFieldHandlers() {
      this.element.querySelectorAll(".teriock-record-field").forEach((container) => {
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
     * @private
     */
    _setupSetFieldHandlers() {
      this.element.querySelectorAll(".teriock-update-set").forEach((container) => {
        const select = container.querySelector("select");
        if (!select) return;

        const name = container.getAttribute("name");
        const getValues = () => Array.from(select.parentElement.querySelectorAll(".tag")).map((tag) => tag.dataset.key);

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

    /**
     * Sets up handlers for array field components.
     * Configures add buttons for array fields.
     * @private
     */
    _setupArrayFieldHandlers() {
      this.element.querySelectorAll(".teriock-array-field-add").forEach((button) => {
        button.addEventListener("click", async (e) => {
          e.preventDefault();
          await this.#addToArrayField(button.getAttribute("name"), button.dataset.path);
        });
      });
    }

    /**
     * Sets up handlers for change field components.
     * Configures change inputs and remove buttons for change arrays.
     * @private
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
      this.element.querySelectorAll(".teriock-remove-change-button").forEach((button) => {
        const { name } = button.attributes;
        const { index } = button.dataset;

        button.addEventListener("click", async () => {
          const existing = foundry.utils.getProperty(this.document, name.value);
          const copy = foundry.utils.deepClone(existing) || [];
          copy.splice(index, 1);
          await this.document.update({ [name.value]: copy });
        });
      });
    }

    /**
     * Prepares the context data for template rendering.
     * Provides common data including config, editable state, document info, and settings.
     * @returns {Promise<object>} Promise that resolves to the context object.
     * @override
     */
    async _prepareContext() {
      return {
        config: CONFIG.TERIOCK,
        editable: this.editable,
        isEditable: this.isEditable,
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
        settings: this.settings,
      };
    }

    /**
     * Sends an image to chat.
     * @param {string} img - The image path to send to chat.
     * @returns {Promise<void>} Promise that resolves when the image is sent.
     */
    async _chatImage(img) {
      await chatImage(img);
    }

    /**
     * Enriches HTML content for display.
     * @param {string} parameter - The HTML content to enrich.
     * @returns {Promise<string|undefined>} Promise that resolves to the enriched HTML or undefined.
     */
    async _editor(parameter) {
      return parameter?.length ? await ux.TextEditor.enrichHTML(parameter, { relativeTo: this.document }) : undefined;
    }

    /**
     * Activates the sheet menu functionality.
     * Sets up menu toggle behavior and initial state.
     * @private
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
     * @param {HTMLElement} element - The input element to connect.
     * @param {string} attribute - The attribute path to update.
     * @param {Function} transformer - Function to transform the input value.
     * @private
     */
    _connectInput(element, attribute, transformer) {
      const update = (e) => {
        const newValue = transformer(e.currentTarget.value);
        this.item.update({ [attribute]: newValue });
      };
      ["focusout", "change"].forEach((evt) => element.addEventListener(evt, update));
      element.addEventListener("keyup", (e) => {
        if (e.key === "Enter") update(e);
      });
    }

    /**
     * Connects button elements to document updates.
     * @param {object} map - Object mapping selectors to attribute paths.
     * @private
     */
    _connectButtonMap(map) {
      const html = $(this.element);
      for (const [selector, path] of Object.entries(map)) {
        html.on("click", selector, (e) => {
          e.preventDefault();
          this.document.update({ [path]: "Insert effect here." });
        });
      }
    }

    /**
     * Connects checkbox elements to document methods.
     * @param {object} map - Object mapping selectors to method names.
     * @private
     */
    _connectCheckboxMap(map) {
      const html = $(this.element);
      for (const [selector, method] of Object.entries(map)) {
        html.on("click", selector, (e) => {
          e.preventDefault();
          this.document[method](e.currentTarget.checked);
        });
      }
    }

    /**
     * Creates a context menu for elements.
     * @param {string} cssClass - The CSS class for elements to attach the menu to.
     * @param {object} options - The context menu options.
     * @param {string} eventName - The event name to trigger the menu.
     * @returns {ux.ContextMenu} The created context menu.
     * @private
     */
    _connectContextMenu(cssClass, options, eventName) {
      const menu = new ux.ContextMenu(this.element, cssClass, options, {
        eventName,
        jQuery: false,
        fixed: false,
      });
      return menu;
    }

    /**
     * Extracts an embedded document from a card element.
     * @param {HTMLElement} target - The target element to extract from.
     * @returns {Document|null} The embedded document or null if not found.
     * @private
     */
    _embeddedFromCard(target) {
      const card = target.closest(".tcard");
      const { id, type, parentId } = card?.dataset ?? {};

      if (type === "item") return this.document.items.get(id);

      if (type === "effect") {
        if (this.document.documentName === "Actor" && this.document._id !== parentId) {
          return this.document.items.get(parentId)?.effects.get(id);
        }
        if (this.document.documentName === "ActiveEffect") {
          return this.document.parent?.effects.get(id);
        }
        return this.document.effects.get(id);
      }
    }

    /**
     * Handles drag start events for embedded documents.
     * @param {DragEvent} event - The drag start event.
     * @private
     */
    _onDragStart(event) {
      const embedded = this._embeddedFromCard(event.currentTarget);
      const dragList = [];
      dragList.push(embedded);
      // Uncomment if migrating copy implementation out of hooks
      // if (embedded?.documentName === "ActiveEffect") {
      //   const children = embedded.getChildren();
      //   children.forEach((child) => {
      //     dragList.push(child);
      //   });
      // }
      const dragData = dragList.map((item) => item?.toDragData());
      console.log("dragData", dragData);
      if (dragData) {
        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
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
     * Handles drop events for documents.
     * @param {DragEvent} event - The drop event.
     * @returns {Promise<boolean>} Promise that resolves to true if drop was handled.
     * @private
     */
    async _onDrop(event) {
      const data = await ux.TextEditor.getDragEventData(event);
      for (const document of data) {
        if (document.type === "ActiveEffect") {
          await this._onDropActiveEffect(event, document);
        } else if (document.type === "Item") {
          await this._onDropItem(event, document);
        }
      }
      return true;
    }

    /**
     * Handles dropping of active effects.
     * @param {DragEvent} event - The drop event.
     * @param {object} data - The effect data.
     * @returns {Promise<boolean>} Promise that resolves to true if drop was successful.
     * @private
     */
    async _onDropActiveEffect(event, data) {
      const effect = await getDocumentClass("ActiveEffect").fromDropData(data);
      if (!this._canDropEffect(effect)) return false;

      await effect.saveFamily();
      const target = this.document.documentName === "ActiveEffect" ? this.document.parent : this.document;
      return await target.createEmbeddedDocuments("ActiveEffect", [effect]);
    }

    /**
     * Checks if an effect can be dropped on this document.
     * @param {ActiveEffect} effect - The effect to check.
     * @returns {boolean} True if the effect can be dropped.
     * @private
     */
    _canDropEffect(effect) {
      return (
        this.document.isOwner &&
        effect &&
        effect.parent !== this.document &&
        effect.target !== this.document &&
        (["Actor", "Item"].includes(this.document.documentName) ||
          (this.document.type === "ability" && effect.type === "ability"))
      );
    }

    /**
     * Handles dropping of items.
     * @param {DragEvent} event - The drop event.
     * @param {object} data - The item data.
     * @returns {Promise<boolean>} Promise that resolves to true if drop was successful.
     * @private
     */
    async _onDropItem(event, data) {
      const item = await getDocumentClass("Item").fromDropData(data);
      if (!this._canDropItem(item)) return false;

      const source = await utils.fromUuid(data.uuid);
      if (item.parent?.documentName === "Actor" && item.type === "equipment") {
        await source.delete();
      }
      return await this.document.createEmbeddedDocuments("Item", [item]);
    }

    /**
     * Checks if an item can be dropped on this document.
     * @param {Item} item - The item to check.
     * @returns {boolean} True if the item can be dropped.
     * @private
     */
    _canDropItem(item) {
      return this.document.isOwner && item && item.parent !== this.document && this.document.documentName === "Actor";
    }

    // Static Actions

    /**
     * Debug action for development purposes.
     * @param {Event} _ - The event object.
     * @param {HTMLElement} __ - The target element.
     * @returns {Promise<void>} Promise that resolves when debug is complete.
     * @static
     */
    static async _debug(_, __) {
      console.log("Debug", this.document, this);
    }

    /**
     * Pulls data from wiki for the current document.
     * @param {Event} _ - The event object.
     * @param {HTMLElement} __ - The target element.
     * @returns {Promise<void>} Promise that resolves when wiki pull is complete.
     * @static
     */
    static async _wikiPullThis(_, __) {
      if (this.editable) this.document.system.wikiPull();
    }

    /**
     * Opens the wiki page for the current document.
     * @param {Event} _ - The event object.
     * @param {HTMLElement} __ - The target element.
     * @returns {Promise<void>} Promise that resolves when wiki page is opened.
     * @static
     */
    static async _wikiOpenThis(_, __) {
      this.document.system.wikiOpen();
    }

    /**
     * Sends the current document to chat.
     * @param {Event} _ - The event object.
     * @param {HTMLElement} __ - The target element.
     * @returns {Promise<void>} Promise that resolves when chat is sent.
     * @static
     */
    static async _chatThis(_, __) {
      this.document.chat();
    }

    /**
     * Reloads the current document and re-renders the sheet.
     * @param {Event} _ - The event object.
     * @param {HTMLElement} __ - The target element.
     * @returns {Promise<void>} Promise that resolves when reload is complete.
     * @static
     */
    static async _reloadThis(_, __) {
      await this.document.update({});
      await this.document.sheet.render();
    }

    /**
     * Toggles the lock state of the current sheet.
     * @param {Event} _ - The event object.
     * @param {HTMLElement} __ - The target element.
     * @returns {Promise<void>} Promise that resolves when lock is toggled.
     * @static
     */
    static async _toggleLockThis(_, __) {
      this._locked = !this._locked;
      this.editable = this.isEditable && !this._locked;
      this.render();
    }

    /**
     * Rolls the current document with optional advantage/disadvantage.
     * @param {Event} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when roll is complete.
     * @static
     */
    static async _rollThis(event, target) {
      const options = event?.altKey ? { advantage: true } : event?.shiftKey ? { disadvantage: true } : {};
      this.document.use(options);
    }

    /**
     * Opens image picker for editing document images.
     * @param {Event} _ - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when image picker is opened.
     * @static
     */
    static async _editImage(_, target) {
      const attr = target.dataset.edit;
      const current = foundry.utils.getProperty(this.document, attr);
      const defaultImg = this.document.constructor.getDefaultArtwork?.(this.document.toObject())?.img;

      return new foundry.applications.apps.FilePicker({
        current,
        type: "image",
        redirectToRoot: defaultImg ? [defaultImg] : [],
        callback: (path) => this.document.update({ [attr]: path }),
        top: this.position.top + 40,
        left: this.position.left + 10,
      }).browse();
    }

    /**
     * Opens the sheet for an embedded document.
     * @param {Event} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when sheet is opened.
     * @static
     */
    static async _openDoc(event, target) {
      this._embeddedFromCard(target)?.sheet.render(true);
    }

    /**
     * Sends an embedded document to chat.
     * @param {Event} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when chat is sent.
     * @static
     */
    static async _chatDoc(event, target) {
      this._embeddedFromCard(target)?.chat();
    }

    /**
     * Uses one unit of an embedded consumable document.
     * @param {Event} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when use is complete.
     * @static
     */
    static async _useOneDoc(event, target) {
      await this._embeddedFromCard(target)?.system.useOne();
    }

    /**
     * Toggles the disabled state of an embedded document.
     * @param {Event} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when toggle is complete.
     * @static
     */
    static async _toggleDisabledDoc(event, target) {
      await this._embeddedFromCard(target)?.toggleDisabled();
    }

    /**
     * Rolls an embedded document with optional advantage/disadvantage.
     * @param {Event} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when roll is complete.
     * @static
     */
    static async _rollDoc(event, target) {
      const options = event?.altKey ? { advantage: true } : event?.shiftKey ? { disadvantage: true } : {};
      const document = this._embeddedFromCard(target);
      if (document?.type === "equipment") {
        if (event?.shiftKey) {
          options.secret = true;
        }
        if (event?.ctrlKey) {
          options.twoHanded = true;
        }
      }
      await document?.use(options);
    }

    /**
     * Toggles a boolean field on the current document.
     * @param {Event} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when toggle is complete.
     * @static
     */
    static async _quickToggle(event, target) {
      const { path } = target.dataset;
      const current = target.dataset.bool === "true";
      await this.document.update({ [path]: !current });
    }

    /**
     * Toggles a boolean field on the sheet and re-renders.
     * @param {Event} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when toggle is complete.
     * @static
     */
    static async _sheetToggle(event, target) {
      const { path } = target.dataset;
      const current = target.dataset.bool === "true";
      foundry.utils.setProperty(this, path, !current);
      this.render();
    }

    // static async _toggleSwitch(event, target) {
    //   const { name, value } = target.dataset;
    //   const newValue = value == 0 ? 1 : value == 1 ? -1 : 0;
    //   this.document.update({ [name]: newValue });
    // }

    /**
     * Creates a new ability for the current document.
     * @param {Event} event - The event object.
     * @param {HTMLElement} __ - The target element.
     * @returns {Promise<ActiveEffect>} Promise that resolves to the created ability.
     * @static
     */
    static async _createAbility(event, __) {
      return await createEffects.createAbility(this.document, null);
    }

    /**
     * Creates a new resource for the current document.
     * @param {Event} event - The event object.
     * @param {HTMLElement} __ - The target element.
     * @returns {Promise<ActiveEffect>} Promise that resolves to the created resource.
     * @static
     */
    static async _createResource(event, __) {
      return await createEffects.createResource(this.document, null);
    }

    /**
     * Creates a new fluency for the current document.
     * @param {Event} event - The event object.
     * @param {HTMLElement} __ - The target element.
     * @returns {Promise<ActiveEffect>} Promise that resolves to the created fluency.
     * @static
     */
    static async _createFluency(event, __) {
      return await createEffects.createFluency(this.document, null);
    }

    /**
     * Creates a new property for the current document.
     * Shows a dialog to select property type or create a new one.
     * @param {Event} event - The event object.
     * @param {HTMLElement} __ - The target element.
     * @returns {Promise<ActiveEffect>} Promise that resolves to the created property.
     * @static
     */
    static async _createProperty(event, __) {
      const createOptions = (obj) =>
        Object.entries(obj)
          .map(([key, value]) => `<option value="${key}">${value}</option>`)
          .join("");

      const { equipmentOptions } = CONFIG.TERIOCK;
      const propertyOptions = [
        ...createOptions(equipmentOptions.properties),
        ...createOptions(equipmentOptions.materialProperties),
        ...createOptions(equipmentOptions.magicalProperties),
      ].join("");

      await new api.DialogV2({
        window: { title: "Create Property" },
        content: `
          <label for="property-select">Select Property</label>
          <select id="property-select" name="property">${propertyOptions}</select>
        `,
        buttons: [
          {
            action: "chosen",
            label: "Add Chosen Property",
            default: true,
            callback: async (event, button) => {
              return await createEffects.createProperty(this.item, button.form.elements.property.value);
            },
          },
          {
            action: "other",
            label: "Create New Property",
            callback: async () => {
              return await createEffects.createProperty(this.item, null);
            },
          },
        ],
      }).render(true);
    }

    // Private helper methods

    /**
     * Adds a key to a record field with validation.
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
     * @param {string} name - The field name.
     * @param {string} fieldPath - The path to the field schema.
     * @returns {Promise<void>} Promise that resolves when the item is added.
     * @private
     */
    async #addToArrayField(name, fieldPath) {
      const cleanFieldPath = fieldPath.startsWith("system.") ? fieldPath.slice(7) : fieldPath;
      const copy = foundry.utils.deepClone(foundry.utils.getProperty(this.document, name)) || [];
      const field = this.document.system.schema.getField(cleanFieldPath).element;
      const initial = field.getInitialValue();

      copy.push(initial);
      await this.document.update({ [name]: copy });
    }

    /**
     * Updates a set field with new values.
     * @param {string} name - The field name.
     * @param {Array} values - Array of values for the set.
     * @returns {Promise<void>} Promise that resolves when the set is updated.
     * @private
     */
    async #updateSetField(name, values = []) {
      await this.document.update({ [name]: new Set(values) });
    }
  };
