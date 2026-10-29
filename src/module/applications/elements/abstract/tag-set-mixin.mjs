import { createElement } from "../../../utils/_module.mjs";

const { setInputAttributes } = foundry.applications.fields;
const { TextEditor } = foundry.applications.ux;

/**
 * @import { FormInputConfig } from "@common/data/_types.mjs";
 * @import { HTMLDocumentTagsElement } from "@client/applications/elements/_module.mjs";
 * @import AbstractTagsElement from "./abstract-tags.mjs";
 */

/**
 * @typedef TagSetInputConfig
 * @property {boolean} [single] - Only allow a single tag. Submitted form value will be a string.
 */

/**
 * Mixin for elements whose value is a set of removable tags added from the text input, a button, or a drop.
 * Based on {@link HTMLDocumentTagsElement}.
 * @template {typeof AbstractTagsElement} T
 * @param {T} Base
 */
export default function TagSetMixin(Base) {
  /**
   * @mixin
   */
  class TagSet extends Base {
    /** @inheritDoc */
    static icons = { ...super.icons, add: "fa-solid fa-plus" };

    /** @inheritDoc */
    static labels = { ...super.labels, add: "ELEMENTS.TAGS.Add" };

    /**
     * Create an element using provided configuration data.
     * @param {FormInputConfig & TagSetInputConfig} config
     * @returns {TagSet}
     */
    static create(config) {
      const el = document.createElement(this.tagName);
      const values = config.value instanceof Set ? Array.from(config.value) : [config.value ?? []].flat();
      el.setAttribute("value", values.join(","));
      el.single = config.single;
      setInputAttributes(el, config);
      return el;
    }

    /**
     * The button element in the input group.
     * @type {HTMLButtonElement}
     */
    #button;

    /**
     * Add a tag and throw an error if it isn't valid.
     * @param {string} key
     * @throws {Error}
     */
    #add(key) {
      const [resolved, label] = this._resolveTag(key);
      if (this.single) { this._value = {}; }
      this._value[resolved] = label;
    }

    /**
     * Remove a single tag by clicking on it removal "x" button.
     * @param {PointerEvent} event
     */
    #onClickTag(event) {
      if (!event.target.classList.contains("remove") || !this.editable) { return; }
      delete this._value[event.target.closest(".tag").dataset.key];
      this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
      this._refresh();
    }

    /**
     * Allow drops even when the containing application isn't itself a valid drop target.
     * @param {DragEvent} event
     */
    #onDragOver(event) {
      if (!this.editable) { return; }
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    }

    /**
     * Handle data dropped onto the form element.
     * @param {DragEvent} event
     */
    #onDrop(event) {
      if (!this.editable) { return; }
      event.preventDefault();
      event.stopImmediatePropagation();
      this._onDropData(TextEditor.implementation.getDragEventData(event));
    }

    /**
     * Add a tag by pressing the ENTER key in the text input.
     * @param {KeyboardEvent} event
     */
    #onKeydown(event) {
      if (event.key !== "Enter") { return; }
      event.preventDefault();
      event.stopPropagation();
      this._tryAdd(this._primaryInput.value);
    }

    /**
     * @inheritDoc
     * @type {Record<string, string>}
     */
    _value = {};

    /**
     * Restrict to only allow a single tag instead of an array of a bunch of tags.
     * @returns {boolean}
     */
    get single() {
      return this.hasAttribute("single");
    }

    /** @param {boolean} value */
    set single(value) {
      this.toggleAttribute("single", value === true);
    }

    /** @inheritDoc */
    _activateListeners() {
      super._activateListeners();
      this.#button.addEventListener("click", this._onClickButton.bind(this));
      this._tags.addEventListener("click", this.#onClickTag.bind(this));
      this._primaryInput.addEventListener("change", event => event.stopPropagation());
      this._primaryInput.addEventListener("keydown", this.#onKeydown.bind(this));
      this.addEventListener("dragover", this.#onDragOver.bind(this), { signal: this.abortSignal });
      this.addEventListener("drop", this.#onDrop.bind(this), { signal: this.abortSignal });
    }

    /** @inheritDoc */
    _buildElements() {
      const [tags, group] = super._buildElements();
      const { icons, labels } = this.constructor;
      this.#button = createElement("button", {
        ariaLabel: _loc(labels.add),
        className: `icon ${icons.add}`,
        dataset: { tooltip: labels.add },
        type: "button",
      });
      group.append(this.#button);
      return [tags, group];
    }

    /** @inheritDoc */
    _getValue() {
      const keys = Object.keys(this._value);
      if (this.single) { return keys[0] ?? null; }
      return keys;
    }

    /**
     * Handle clicking the button in the input group.
     * @abstract
     */
    _onClickButton() {}

    /**
     * Handle data dropped onto the form element.
     * @param {object} data
     * @abstract
     */
    _onDropData(data) {}

    /** @inheritDoc */
    _refresh() {
      if (!this._tags) { return; }
      if (this.hasAttribute("value")) {
        this._setValue(this.getAttribute("value").split(",").filter(Boolean));
        this.removeAttribute("value");
      }
      const tags = Object.entries(this._value).map(([k, v]) => this.constructor.renderTag(k, v, this.editable));
      this._tags.replaceChildren(...tags);
    }

    /**
     * Resolve a tag's key and label. Throw an error if it isn't valid.
     * @param {string} key
     * @returns {[string, string]}
     * @throws {Error}
     * @abstract
     */
    _resolveTag(key) {
      return [key, key];
    }

    /** @inheritDoc */
    _setValue(value) {
      this._value = {};
      for (const key of [value ?? []].flat()) {
        try {
          this.#add(key);
        } catch {
          this._value[key] = `${key} [INVALID]`;
        }
      }
    }

    /**
     * Add a tag from user input and notify the user if it isn't valid.
     * @param {string} key
     */
    _tryAdd(key) {
      if (!this.editable) { return; }
      try {
        this.#add(key);
        this._refresh();
      } catch (err) {
        ui.notifications.error(err.message);
      }
      this._primaryInput.value = "";
      this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
      this._primaryInput.focus();
    }
  }

  return TagSet;
}
