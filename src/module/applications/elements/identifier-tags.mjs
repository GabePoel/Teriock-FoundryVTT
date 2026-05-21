import { icons } from "../../constants/display/icons.mjs";
import { identifierValidator } from "../../data/fields/helpers/validators.mjs";
import { inferNameFromIdentifier, makeIconClass, parseIdentifier } from "../../helpers/utils.mjs";
import { TeriockTextEditor } from "../ux/_module.mjs";

const { AbstractFormInputElement, HTMLStringTagsElement } = foundry.applications.elements;
const { TextEditor } = foundry.applications.ux;

/**
 * @import {FormInputConfig} from "@common/data/_types.mjs";
 */

/**
 * @typedef IdentifierTagsInputConfig
 * @property {string} [type] - A specific document type for a typed identifier.
 * @property {boolean} [allowType] - Allow typed identifiers in the form `type:identifier`
 * @property {boolean} [single] - Only allow referencing a single identifier. In this case the submitted form value will be a single string rather than an array.
 * @property {number} [max] - Only allow attaching a maximum number of identifiers.
 * @property {string|null} [reset] - Identifier applied when the reset button is clicked (single mode only).
 */

/**
 * @typedef HTMLIdentifierTagsOptions
 * @property {string[]} [values] - An array of identifiers to initialize the element with.
 * @property {boolean} [allowType]
 */

/**
 * A custom HTMLElement used to render a set of associated documents names
 * by their identifiers. This is based off of {@link HTMLDocumentTagsElement}.
 * @extends {AbstractFormInputElement<string|string[]|null>}
 */
export default class HTMLIdentifierTagsElement extends AbstractFormInputElement {
  /** @override */
  static tagName = "identifier-tags";

  /**
   * Create a HTMLIdentifierTagsElement using provided configuration data.
   * @param {FormInputConfig & IdentifierTagsInputConfig} config
   * @returns {HTMLIdentifierTagsElement}
   */
  static create(config) {
    // Coerce value to an array
    let values;
    if (config.value instanceof Set) {
      values = Array.from(config.value);
    } else if (!Array.isArray(config.value)) {
      values = config.value ? [config.value] : [];
    } else {
      values = config.value;
    }

    const tags = new this({ allowType: config.allowType, values });
    tags.name = config.name;
    tags.setAttribute("value", values.join(","));
    tags.type = config.type;
    tags.max = config.max;
    tags.single = config.single;
    tags.allowType = config.allowType;
    tags.reset = config.reset;
    foundry.applications.fields.setInputAttributes(tags, config);
    return tags;
  }

  /**
   * Create an HTML element fragment for a single identifier tag.
   * @param {string} identifier        The document identifier
   * @param {string} name              The document name
   * @param {boolean} [editable=true]  Is the tag editable?
   * @returns {HTMLDivElement}
   */
  static renderTag(identifier, name, editable = true) {
    const div = HTMLStringTagsElement.renderTag(
      identifier,
      TextEditor.implementation.truncateText(name, { maxLength: 32 }),
      editable,
    );
    div.classList.add("identifier-tag");
    div.querySelector("span").dataset.tooltipText = identifier;
    if (editable) {
      const t = _loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.remove");
      const a = div.querySelector("a");
      a.dataset.tooltipText = t;
      a.ariaLabel = t;
    }
    return div;
  }

  /**
   * @param {HTMLIdentifierTagsOptions} [options]
   */
  constructor({ allowType, values } = {}) {
    super();
    if (allowType !== undefined) {
      this.allowType = allowType;
    }
    this._initializeTags(values);
  }

  /**
   * The button element to add a new identifier. Omitted in single-value mode.
   * @type {HTMLButtonElement|undefined}
   */
  #button;

  /**
   * The input element to define an identifier.
   * @type {HTMLInputElement}
   */
  #input;

  /**
   * The button element to reset to the configured default identifier. Single-value mode only.
   * @type {HTMLButtonElement|undefined}
   */
  #resetButton;

  /**
   * The list of tagged identifiers. Omitted in single-value mode.
   * @type {HTMLDivElement|undefined}
   */
  #tags;

  /**
   * Add a new identifier to the tagged set, throwing an error if the identifier is not valid.
   * @param {string} identifier - The identifier to add.
   * @throws {Error} - If the identifier is not valid
   */
  #add(identifier) {
    if (!this.editable) {
      return;
    }
    identifier = this.#validateIdentifier(identifier);

    const { max, single } = this;

    if (max && Object.keys(this._value).length >= max) {
      throw new Error(_loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.errorMax", { max, name: this.name }));
    }

    if (single) {
      for (const k of Object.keys(this._value)) {
        delete this._value[k];
      }
    }

    this._value[identifier] = inferNameFromIdentifier(identifier) ?? identifier ?? "";
  }

  /**
   * Commit the current input value in single-value mode.
   */
  #commitSingleInput() {
    if (!this.editable) {
      return;
    }
    const identifier = this.#input.value.trim();
    this._value = {};
    if (!identifier) {
      this._refresh();
      this.#dispatchValueChange();
      return;
    }
    try {
      this.#add(identifier);
      this._refresh();
      this.#dispatchValueChange();
    } catch (err) {
      ui.notifications.error(err.message);
    }
  }

  /**
   * Notify the parent form that this element's value changed.
   */
  #dispatchValueChange() {
    this.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  }

  /**
   * Remove a single identifier by clicking on its tag.
   * @param {PointerEvent} event
   */
  #onClickTag(event) {
    if (!event.target.classList.contains("remove") || !this.editable) {
      return;
    }
    const tag = event.target.closest(".tag");
    delete this._value[tag.dataset.key];
    this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    this._refresh();
  }

  /**
   * Handle data dropped onto the form element.
   * @param {DragEvent} event
   */
  #onDrop(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const dropData = TeriockTextEditor.getDragEventData(event);
    if (dropData.identifier) {
      this.#tryAdd(dropData.identifier);
    } else {
      // Fallback for cases like compendium directories where Foundry doesn't use the normal drag-drop
      if (dropData.uuid) {
        fromUuid(dropData.uuid).then(d => {
          const identifier = d?.typedIdentifier;
          if (identifier) {
            this.#tryAdd(identifier);
          } else {
            ui.notifications.error("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.noIdentifier", { localize: true });
          }
        });
      } else {
        ui.notifications.error("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.noIdentifier", { localize: true });
      }
    }
  }

  /**
   * Add a new identifier tag by pressing the ENTER key in the input field.
   * @param {KeyboardEvent} event
   */
  #onKeydown(event) {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (this.single) {
      this.#commitSingleInput();
    } else {
      this.#tryAdd(this.#input.value);
    }
  }

  /**
   * Reset the identifier to the configured default value.
   */
  #onReset() {
    if (!this.reset || !this.editable) {
      return;
    }
    this.#input.value = this.reset;
    this.#commitSingleInput();
  }

  /**
   * Add an identifier using the value of the input field.
   * @param {string} identifier  The identifier to attempt to add
   */
  #tryAdd(identifier) {
    if (this.single) {
      this.#input.value = identifier;
      this.#commitSingleInput();
      return;
    }
    try {
      this.#add(identifier);
      this._refresh();
    } catch (err) {
      ui.notifications.error(err.message);
    }
    this.#input.value = "";
    this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    this.#input.focus();
  }

  /**
   * Validate an identifier, returning the trimmed value.
   * @param {Identifier|TypedIdentifier} identifier
   * @returns {string}
   * @throws {Error}
   * @todo Consider making these errors into notifications?
   */
  #validateIdentifier(identifier) {
    identifier = identifier.trim();
    if (!identifier) {
      throw new Error(_loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.errorBlank"));
    }

    const { allowType, type: requiredType } = this;

    if (!identifierValidator(identifier, { allowType })) {
      throw new Error(_loc("TERIOCK.SYSTEMS.Rules.FIELDS.identifier.validationError"));
    }

    const parsed = parseIdentifier(identifier);
    if (!allowType && parsed.type) {
      throw new Error(_loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.errorTypedNotAllowed"));
    }
    if (requiredType && parsed.type !== requiredType) {
      throw new Error(
        _loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.errorWrongType", {
          provided: parsed.type ?? identifier,
          required: requiredType,
        }),
      );
    }
    return identifier;
  }

  /**
   * @override
   * @type {Record<string, string>}
   */
  _value = {};

  /**
   * Allow typed identifiers in the form `type:identifier`.
   * @returns {boolean}
   */
  get allowType() {
    return this.hasAttribute("allow-type");
  }

  /**
   * @param {boolean} value
   */
  set allowType(value) {
    this.toggleAttribute("allow-type", value === true);
  }

  /**
   * Allow a maximum number of identifiers to be tagged to the element.
   * @returns {number}
   */
  get max() {
    const max = parseInt(this.getAttribute("max"));
    return isNaN(max) ? Infinity : max;
  }

  /**
   * @param {number} value
   */
  set max(value) {
    if (Number.isInteger(value) && value > 0) {
      this.setAttribute("max", String(value));
    } else {
      this.removeAttribute("max");
    }
  }

  /**
   * The identifier applied when the reset button is clicked.
   * @type {string|null}
   */
  get reset() {
    return this.getAttribute("reset");
  }

  /**
   * @param {string|null} value
   */
  set reset(value) {
    if (value) {
      this.setAttribute("reset", value);
    } else {
      this.removeAttribute("reset");
    }
  }

  /**
   * Restrict to only allow referencing a single identifier instead of an array of identifiers.
   * @returns {boolean}
   */
  get single() {
    return this.hasAttribute("single");
  }

  /**
   * @param {boolean} value
   */
  set single(value) {
    this.toggleAttribute("single", value === true);
  }

  /**
   * Restrict identifiers to a specific Teriock document type prefix.
   * @returns {string|null}
   */
  get type() {
    return this.getAttribute("type");
  }

  /**
   * @param {string|null} value
   */
  set type(value) {
    if (!value) {
      this.removeAttribute("type");
      return;
    }
    if (!TERIOCK.config.document[value]) {
      throw new Error(`"${value}" is not a valid Teriock document type in TERIOCK.config.document`);
    }
    this.setAttribute("type", value);
  }

  /** @override */
  _activateListeners() {
    this.#button?.addEventListener("click", () => this.#tryAdd(this.#input.value));
    this.#resetButton?.addEventListener("click", this.#onReset.bind(this));
    this.#tags?.addEventListener("click", this.#onClickTag.bind(this));
    this.#input.addEventListener("keydown", this.#onKeydown.bind(this));
    this.#input.addEventListener("change", event => {
      event.stopPropagation();
      if (this.single) {
        this.#commitSingleInput();
      }
    });
    this.addEventListener("drop", this.#onDrop.bind(this), { signal: this.abortSignal });
  }

  /** @override */
  _buildElements() {
    this.#input = this._primaryInput = document.createElement("input");
    this.#input.type = "text";
    const typeLabel = this.type ? TERIOCK.config.document[this.type]?.label : "TERIOCK.TERMS.Common.identifier";
    this.#input.placeholder =
      this.getAttribute("placeholder") ||
      _loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.placeholder", { type: _loc(typeLabel) });

    const elements = [this.#input];
    if (this.single) {
      if (this.reset) {
        this.#resetButton = document.createElement("button");
        this.#resetButton.type = "button";
        this.#resetButton.className = `icon ${makeIconClass(icons.ui.reset, "button")}`;
        this.#resetButton.dataset.tooltip = "TERIOCK.ELEMENTS.IDENTIFIER_TAGS.reset";
        this.#resetButton.setAttribute("aria-label", _loc(this.#resetButton.dataset.tooltip));
        elements.push(this.#resetButton);
      }
      return elements;
    }

    this.#tags = document.createElement("div");
    this.#tags.className = "tags input-element-tags";
    elements.unshift(this.#tags);

    this.#button = document.createElement("button");
    this.#button.type = "button";
    this.#button.className = "icon fa-solid fa-magnifying-glass-plus";
    this.#button.dataset.tooltip = "TERIOCK.ELEMENTS.IDENTIFIER_TAGS.add";
    this.#button.setAttribute("aria-label", _loc(this.#button.dataset.tooltip));
    elements.push(this.#button);
    return elements;
  }

  /** @override */
  _getValue() {
    if (this.single) {
      return Object.keys(this._value)[0] ?? null;
    }
    return Object.keys(this._value);
  }

  /**
   * Initialize innerText or an initial value attribute of the element as a comma-separated list.
   * @param {string[]} [values] - An array of identifiers to initialize the element with.
   */
  _initializeTags(values) {
    let tags = [];
    if (Array.isArray(values)) {
      tags = values;
    } else {
      const initial = this.getAttribute("value") || this.innerText || "";
      if (initial) {
        tags = initial.split(",");
      }
    }
    for (const t of tags) {
      const identifier = t.trim();
      if (!identifier) {
        continue;
      }
      try {
        this.#add(identifier);
      } catch {
        this._value[identifier] = `${identifier} [INVALID]`;
      }
    }
    this.innerText = "";
    this.removeAttribute("value");
  }

  /** @override */
  _refresh() {
    if (this.single) {
      if (this.#input) {
        this.#input.value = Object.keys(this._value)[0] ?? "";
      }
      return;
    }
    if (!this.#tags) {
      return;
    }
    const tags = Object.entries(this._value).map(([k, v]) => this.constructor.renderTag(k, v, this.editable));
    this.#tags.replaceChildren(...tags);
  }

  /** @override */
  _setValue(value) {
    this._value = {};
    if (!value) {
      this._refresh();
      return;
    }
    if (typeof value === "string") {
      value = [value];
    }
    for (const identifier of value) {
      try {
        this.#add(identifier);
      } catch {
        this._value[identifier] = `${identifier} [INVALID]`;
      }
    }
    this._refresh();
  }

  /** @override */
  _toggleDisabled(disabled) {
    this.#input.disabled = disabled;
    if (this.#button) {
      this.#button.disabled = disabled;
    }
    if (this.#resetButton) {
      this.#resetButton.disabled = disabled;
    }
  }
}
