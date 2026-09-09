import { validateTypedIdentifier } from "../../data/fields/tools/validators.mjs";
import { createElement } from "../../helpers/html.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import { listFormat } from "../../helpers/localization.mjs";
import { isKebabCase } from "../../helpers/string.mjs";
import { parseIdentifier } from "../../helpers/utils.mjs";
import { TeriockTextEditor } from "../ux/_module.mjs";

const { AbstractFormInputElement, HTMLStringTagsElement } = foundry.applications.elements;
const { fromUuid } = foundry.utils;

/**
 * @import { FormInputConfig } from "@common/data/_types.mjs";
 * @import { HTMLDocumentTagsElement } from "@client/applications/elements/_module.mjs";
 */

/**
 * @typedef IdentifierTagsInputConfig
 * @property {string[]} [types] - Allowed type prefixes for typed identifiers.
 * @property {boolean} [single] - Only allow referencing a single identifier. Submitted form will be a string.
 */

/**
 * @typedef HTMLIdentifierTagsOptions
 * @property {string[]} [values] - An array of identifiers to initialize the element with.
 */

/**
 * A custom HTMLElement used to render a set of associated documents referenced by identifier.
 * Based on {@link HTMLDocumentTagsElement}.
 */
export default class HTMLIdentifierTagsElement extends AbstractFormInputElement {
  /** @inheritDoc */
  static tagName = "identifier-tags";

  /**
   * Create a HTMLIdentifierTagsElement using provided configuration data.
   * @param {FormInputConfig & IdentifierTagsInputConfig} config
   * @returns {HTMLIdentifierTagsElement}
   */
  static create(config) {
    let values;
    if (config.value instanceof Set) { values = Array.from(config.value); }
    else if (!Array.isArray(config.value)) { values = config.value ? [config.value] : []; }
    else { values = config.value; }

    const tags = new this({ values });
    tags.name = config.name;
    tags.setAttribute("value", values.join(","));
    tags.types = config.types;
    tags.single = config.single;
    foundry.applications.fields.setInputAttributes(tags, config);
    return tags;
  }

  /**
   * Create an HTML element fragment for a single identifier tag.
   * @param {string} identifier - The document identifier
   * @param {string} name - The document name
   * @param {boolean} [editable=true] - Is the tag editable?
   * @returns {HTMLDivElement}
   */
  static renderTag(identifier, name, editable = true) {
    const div = HTMLStringTagsElement.renderTag(
      identifier,
      TeriockTextEditor.truncateText(name, { maxLength: 32 }),
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
  constructor({ values } = {}) {
    super();
    this._initializeTags(values);
  }

  /**
   * The button element to add a new identifier.
   * @type {HTMLButtonElement}
   */
  #button;

  /**
   * The input element to define an identifier.
   * @type {HTMLInputElement}
   */
  #input;

  /**
   * The list of tagged identifiers.
   * @type {HTMLDivElement}
   */
  #tags;

  /**
   * Add a new identifier to the tagged set, throwing an error if the identifier is not valid.
   * @param {Identifier} identifier - The identifier to add
   * @throws {Error} If the identifier is not valid
   */
  #add(identifier) {
    if (!this.editable) { return; }
    identifier = this.#validateIdentifier(identifier);
    if (this.single) { for (const k of Object.keys(this._value)) { delete this._value[k]; } }
    this._value[identifier] = game.teriock.identifiers.getName(identifier) ?? identifier;
  }

  /**
   * Remove a single identifier by clicking on its tag.
   * @param {PointerEvent} event
   */
  #onClickTag(event) {
    if (!event.target.classList.contains("remove") || !this.editable) { return; }
    const tag = event.target.closest(".tag");
    delete this._value[tag.dataset.key];
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
    const dropData = TeriockTextEditor.getDragEventData(event);
    if (dropData.identifier) {
      this.#tryAdd(dropData.identifier);
      return;
    }
    if (dropData.uuid) {
      fromUuid(dropData.uuid).then(d => {
        const identifier = d?.typedIdentifier;
        if (identifier) { this.#tryAdd(identifier); }
        else { ui.notifications.error("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.noIdentifier", { localize: true }); }
      });
      return;
    }
    ui.notifications.error("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.noIdentifier", { localize: true });
  }

  /**
   * Add a new identifier tag by pressing the ENTER key in the input field.
   * @param {KeyboardEvent} event
   */
  #onKeydown(event) {
    if (event.key !== "Enter") { return; }
    event.preventDefault();
    event.stopPropagation();
    this.#tryAdd(this.#input.value);
  }

  /**
   * Resolve a label for the input placeholder from configured type restrictions.
   * @returns {string}
   */
  #resolvePlaceholderTypeLabel() {
    const { types } = this;
    if (!types.length) { return "TERIOCK.COMMON.Identifier"; }
    if (types.length === 1) { return TERIOCK.config.document[types[0]]?.label ?? types[0]; }
    return types.map(t => _loc(TERIOCK.config.document[t]?.label ?? t)).join(", ");
  }

  /**
   * Add an identifier using the value of the input field.
   * @param {string} identifier - The identifier to attempt to add
   */
  #tryAdd(identifier) {
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
   * Validate an identifier.
   * @param {string} identifier
   * @returns {Identifier}
   * @throws {Error}
   */
  #validateIdentifier(identifier) {
    identifier = identifier.trim();
    if (!identifier) { throw new Error(_loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.errorBlank")); }
    const types = this.types;
    if (!validateTypedIdentifier(identifier, { types })) {
      const parsed = parseIdentifier(identifier);
      if (!parsed.type) { throw new Error(_loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.errorRequireType")); }
      if (types.length) {
        throw new Error(
          _loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.errorWrongType", {
            provided: parsed.type,
            required: listFormat(types, { type: "disjunction" }),
          }),
        );
      }
      throw new Error(_loc("TERIOCK.SYSTEMS.Rules.FIELDS.identifier.validationError"));
    }
    return identifier;
  }

  /**
   * @inheritDoc
   * @type {Record<string, string>}
   * @protected
   */
  _value = {};

  /**
   * Restrict to only allow referencing a single identifier instead of an array of identifiers.
   * @return {boolean}
   */
  get single() {
    return this.hasAttribute("single");
  }

  /** @param {boolean} value */
  set single(value) {
    this.toggleAttribute("single", value === true);
  }

  /**
   * Restrict identifiers to only certain type prefixes.
   * @return {string[]}
   */
  get types() {
    const attr = this.getAttribute("types");
    if (!attr) { return []; }
    return attr.split(",").map(t => t.trim()).filter(Boolean);
  }

  /** @param {string[]} value */
  set types(value) {
    if (!value?.length) {
      this.removeAttribute("types");
      return;
    }
    for (const type of value) {
      if (!isKebabCase(type)) { throw new Error(`"${type}" is not a valid identifier type.`); }
    }
    this.setAttribute("types", value.map(v => v.trim()).filter(Boolean).join(","));
  }

  /** @inheritDoc */
  _activateListeners() {
    this.#button.addEventListener("click", () => this.#tryAdd(this.#input.value));
    this.#tags.addEventListener("click", this.#onClickTag.bind(this));
    this.#input.addEventListener("keydown", this.#onKeydown.bind(this));
    this.#input.addEventListener("change", event => event.stopPropagation());
    this.addEventListener("dragover", this.#onDragOver.bind(this), { signal: this.abortSignal });
    this.addEventListener("drop", this.#onDrop.bind(this), { signal: this.abortSignal });
  }

  /** @inheritDoc */
  _buildElements() {
    this.#tags = createElement("div", { className: "tags input-element-tags" });
    this.#input = this._primaryInput = createElement("input", {
      placeholder: this.getAttribute("placeholder")
        || _loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.placeholder", { type: _loc(this.#resolvePlaceholderTypeLabel()) }),
      type: "text",
    });
    this.#button = createElement("button", {
      ariaLabel: _loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.add"),
      className: `icon ${makeIconClass("fa-magnifying-glass-plus", "button")}`,
      dataset: { tooltip: "TERIOCK.ELEMENTS.IDENTIFIER_TAGS.add" },
      type: "button",
    });
    this.#button.type = "button";
    const group = createElement("div", { className: "input-group" });
    group.append(this.#input, this.#button);
    return [this.#tags, group];
  }

  /** @inheritDoc */
  _getValue() {
    const identifiers = Object.keys(this._value);
    if (this.single) { return identifiers[0] ?? null; }
    return identifiers;
  }

  /**
   * Initialize textContent or an initial value attribute of the element as a comma-separated list.
   * @param {string[]} [values] - An array of identifiers to initialize the element with.
   */
  _initializeTags(values) {
    let tags = [];
    if (Array.isArray(values)) { tags = values; }
    else {
      const initial = this.getAttribute("value") || this.textContent || "";
      if (initial) { tags = initial.split(","); }
    }
    for (const t of tags) {
      const identifier = t.trim();
      if (!identifier) { continue; }
      try {
        this.#add(identifier);
      } catch {
        this._value[identifier] = `${identifier} [INVALID]`;
      }
    }
    this.textContent = "";
    this.removeAttribute("value");
  }

  /** @inheritDoc */
  _refresh() {
    if (!this.#tags) { return; }
    const tags = Object.entries(this._value).map(([k, v]) => this.constructor.renderTag(k, v, this.editable));
    this.#tags.replaceChildren(...tags);
  }

  /** @inheritDoc */
  _setValue(value) {
    this._value = {};
    if (!value) {
      this._refresh();
      return;
    }
    if (typeof value === "string") { value = [value]; }
    for (const identifier of value) {
      try {
        this.#add(identifier);
      } catch {
        this._value[identifier] = `${identifier} [INVALID]`;
      }
    }
    this._refresh();
  }

  /** @inheritDoc */
  _toggleDisabled(disabled) {
    this.#input.disabled = disabled;
    this.#button.disabled = disabled;
  }
}
