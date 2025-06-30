const { utils } = foundry;
const { ux, api } = foundry.applications;
import { chatImage } from "../../helpers/utils.mjs";
import { imageContextMenuOptions } from "../misc-sheets/image-sheet/connections/_context-menus.mjs";
import * as createEffects from "../../helpers/create-effects.mjs";
import connectEmbedded from "../../helpers/connect-embedded.mjs";

export const TeriockSheet = (Base) =>
  class TeriockSheet extends Base {
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

    constructor(...args) {
      super(...args);
      this._menuOpen = false;
      this._contextMenus = [];
      this._locked = true;
      this.settings = {};
    }

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

    _setupArrayFieldHandlers() {
      this.element.querySelectorAll(".teriock-array-field-add").forEach((button) => {
        button.addEventListener("click", async (e) => {
          e.preventDefault();
          await this.#addToArrayField(button.getAttribute("name"), button.dataset.path);
        });
      });
    }

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

    async _chatImage(img) {
      await chatImage(img);
    }

    async _editor(parameter) {
      return parameter?.length ? await ux.TextEditor.enrichHTML(parameter, { relativeTo: this.document }) : undefined;
    }

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

    _connect(selector, eventType, handler) {
      this.element.querySelectorAll(selector).forEach((el) =>
        el.addEventListener(eventType, (e) => {
          e.preventDefault();
          handler(e);
        }),
      );
    }

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

    _connectButtonMap(map) {
      const html = $(this.element);
      for (const [selector, path] of Object.entries(map)) {
        html.on("click", selector, (e) => {
          e.preventDefault();
          this.document.update({ [path]: "Insert effect here." });
        });
      }
    }

    _connectCheckboxMap(map) {
      const html = $(this.element);
      for (const [selector, method] of Object.entries(map)) {
        html.on("click", selector, (e) => {
          e.preventDefault();
          this.document[method](e.currentTarget.checked);
        });
      }
    }

    _connectContextMenu(cssClass, options, eventName) {
      const menu = new ux.ContextMenu(this.element, cssClass, options, {
        eventName,
        jQuery: false,
        fixed: false,
      });
      return menu;
    }

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

    _onDragStart(event) {
      const embedded = this._embeddedFromCard(event.currentTarget);
      const dragData = embedded?.toDragData();
      if (dragData) {
        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
      }
    }

    _onDragOver(_event) {
      // TODO: Provide visual feedback.
    }

    async _onDrop(event) {
      const data = await ux.TextEditor.getDragEventData(event);
      return data.type === "ActiveEffect"
        ? this._onDropActiveEffect(event, data)
        : data.type === "Item"
          ? this._onDropItem(event, data)
          : false;
    }

    async _onDropActiveEffect(event, data) {
      const effect = await getDocumentClass("ActiveEffect").fromDropData(data);
      if (!this._canDropEffect(effect)) return false;

      await effect.saveFamily();
      const target = this.document.documentName === "ActiveEffect" ? this.document.parent : this.document;
      return await target.createEmbeddedDocuments("ActiveEffect", [effect]);
    }

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

    async _onDropItem(event, data) {
      const item = await getDocumentClass("Item").fromDropData(data);
      if (!this._canDropItem(item)) return false;

      const source = await utils.fromUuid(data.uuid);
      if (item.parent?.documentName === "Actor" && item.type === "equipment") {
        await source.delete();
      }
      return await this.document.createEmbeddedDocuments("Item", [item]);
    }

    _canDropItem(item) {
      return this.document.isOwner && item && item.parent !== this.document && this.document.documentName === "Actor";
    }

    // Static Actions
    static async _debug(_, __) {
      console.log("Debug", this.document, this);
    }
    static async _wikiPullThis(_, __) {
      if (this.editable) this.document.system.wikiPull();
    }
    static async _wikiOpenThis(_, __) {
      this.document.system.wikiOpen();
    }
    static async _chatThis(_, __) {
      this.document.chat();
    }
    static async _reloadThis(_, __) {
      await this.document.update({});
      await this.document.sheet.render();
    }

    static async _toggleLockThis(_, __) {
      this._locked = !this._locked;
      this.editable = this.isEditable && !this._locked;
      this.render();
    }

    static async _rollThis(event, target) {
      const options = event?.altKey ? { advantage: true } : event?.shiftKey ? { disadvantage: true } : {};
      this.document.use(options);
    }

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

    static async _openDoc(event, target) {
      this._embeddedFromCard(target)?.sheet.render(true);
    }
    static async _chatDoc(event, target) {
      this._embeddedFromCard(target)?.chat();
    }
    static async _useOneDoc(event, target) {
      await this._embeddedFromCard(target)?.system.useOne();
    }
    static async _toggleDisabledDoc(event, target) {
      await this._embeddedFromCard(target)?.toggleDisabled();
    }

    static async _rollDoc(event, target) {
      const options = event?.altKey ? { advantage: true } : event?.shiftKey ? { disadvantage: true } : {};
      await this._embeddedFromCard(target)?.use(options);
    }

    static async _quickToggle(event, target) {
      const { path } = target.dataset;
      const current = target.dataset.bool === "true";
      await this.document.update({ [path]: !current });
    }

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

    static async _createAbility(event, __) {
      return await createEffects.createAbility(this.document, null);
    }
    static async _createResource(event, __) {
      return await createEffects.createResource(this.document, null);
    }
    static async _createFluency(event, __) {
      return await createEffects.createFluency(this.document, null);
    }

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

    async #addToArrayField(name, fieldPath) {
      const cleanFieldPath = fieldPath.startsWith("system.") ? fieldPath.slice(7) : fieldPath;
      const copy = foundry.utils.deepClone(foundry.utils.getProperty(this.document, name)) || [];
      const field = this.document.system.schema.getField(cleanFieldPath).element;
      const initial = field.getInitialValue();

      copy.push(initial);
      await this.document.update({ [name]: copy });
    }

    async #updateSetField(name, values = []) {
      await this.document.update({ [name]: new Set(values) });
    }
  };
