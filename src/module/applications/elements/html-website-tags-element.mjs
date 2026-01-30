import { makeIconClass } from "../../helpers/utils.mjs";

const { AbstractFormInputElement, HTMLStringTagsElement } =
  foundry.applications.elements;

/**
 * @typedef WebsiteTagsInputConfig
 * @property {boolean} [single] Only allow referencing a single website. In this case the submitted form value will
 * be a single URL string rather than an array
 * @property {number} [max] Only allow attaching a maximum number of websites
 */

/**
 * @typedef URLWebsiteTagsOptions
 * @property {string[]} [values]  An array of website urls to initialize the element with.
 */

export default class HTMLWebsiteTagsElement extends AbstractFormInputElement {
  /** @override */
  static tagName = "website-tags";

  /**
   * @param {URLWebsiteTagsOptions} [options]
   */
  constructor({ values } = {}) {
    super();
    this._initializeTags(values);
  }

  /**
   * Create a HTMLWebsiteTagsElement using provided configuration data.
   * @param {FormInputConfig & WebsiteTagsInputConfig} config
   * @returns {HTMLWebsiteTagsElement}
   */
  static create(config) {
    // Coerce value to an array
    let values;
    if (config.value instanceof Set) values = Array.from(config.value);
    else if (!Array.isArray(config.value)) values = [config.value];
    else values = config.value;

    const tags = new this({ values });
    tags.name = config.name;
    tags.setAttribute("value", values);
    tags.max = config.max;
    tags.single = config.single;
    foundry.applications.fields.setInputAttributes(tags, config);
    return tags;
  }

  /**
   * Create an HTML string fragment for a single website tag.
   * @param {string} url The website URL
   * @param {string} name The name of the website
   * @param {boolean} [editable=true]  Is the tag editable?
   * @returns {HTMLDivElement}
   */
  static renderTag(url, name, editable = true) {
    const div = HTMLStringTagsElement.renderTag(url, name, editable);
    div.classList.add("website-tag");
    div.querySelector("span").dataset.tooltipText = url;
    if (editable) {
      const t = "Remove Website";
      const a = div.querySelector("a");
      a.dataset.tooltipText = t;
      a.ariaLabel = t;
    }
    return div;
  }

  /**
   * The button element to add a new website.
   * @type {HTMLButtonElement}
   */
  #button;

  /**
   * The input element to define a website URL.
   * @type {HTMLInputElement}
   */
  #input;

  /**
   * The list of tagged websites.
   * @type {HTMLDivElement}
   */
  #tags;

  /**
   * @override
   * @type {Record<string, string>}
   * @protected
   */
  _value = {};

  /**
   * Allow a maximum number of websites to be tagged to the element.
   * @type {number}
   */
  get max() {
    const max = parseInt(this.getAttribute("max"));
    return isNaN(max) ? Infinity : max;
  }

  set max(value) {
    if (Number.isInteger(value) && value > 0)
      this.setAttribute("max", String(value));
    else this.removeAttribute("max");
  }

  /**
   * Restrict to only allow referencing a single website instead of an array of websites.
   * @returns {boolean}
   */
  get single() {
    return this.hasAttribute("single");
  }

  set single(value) {
    this.toggleAttribute("single", value === true);
  }

  #add(url) {
    if (!this.editable) return;

    // Restrict to a maximum number of tagged websites
    if (this.max && Object.keys(this._value).length >= this.max) {
      throw new Error(
        `You may only attach at most ${this.max} websites to the "${this.name}" field`,
      );
    }

    // Replace singleton
    if (this.single) {
      for (const k of Object.keys(this._value)) delete this._value[k];
    }

    // Display the website URL
    this._value[url] = url;
  }

  /**
   * Remove a single coefficient by clicking on its tag.
   * @param {PointerEvent} event
   */
  #onClickTag(event) {
    /** @type {HTMLElement} */
    const target = event.target;
    if (!target.classList.contains("remove") || !this.editable) return;
    const tag = /** @type {HTMLElement} */ target.closest(".tag");
    delete this._value[tag.dataset.key];
    this.dispatchEvent(
      new Event("change", { bubbles: true, cancelable: true }),
    );
    this._refresh();
  }

  /**
   * Handle data dropped onto the form element.
   * @param {DragEvent} event
   */
  #onDrop(event) {
    event.preventDefault();
    const url =
      event.dataTransfer.getData("text/uri-list") ||
      event.dataTransfer.getData("text/plain");
    if (url) this.#tryAdd(url);
  }

  /**
   * Add a new document tag by pressing the ENTER key in the URL input field.
   * @param {KeyboardEvent} event
   */
  #onKeydown(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.stopPropagation();
    this.#tryAdd(this.#input.value);
  }

  /**
   * Add a website to the tagged set using the value of the input field.
   * @param {string} url The URL to attempt to add
   */
  #tryAdd(url) {
    try {
      this.#add(url);
      this._refresh();
    } catch (err) {
      ui.notifications.error(err.message);
    }
    this.#input.value = "";
    this.dispatchEvent(
      new Event("change", { bubbles: true, cancelable: true }),
    );
    this.#input.focus();
  }

  /** @override */
  _activateListeners() {
    this.#button.addEventListener("click", () =>
      this.#tryAdd(this.#input.value),
    );
    this.#tags.addEventListener("click", this.#onClickTag.bind(this));
    this.#input.addEventListener("keydown", this.#onKeydown.bind(this));
    this.#input.addEventListener("change", (event) => event.stopPropagation());
    this.addEventListener("drop", this.#onDrop.bind(this), {
      signal: this.abortSignal,
    });
  }

  /** @override */
  _buildElements() {
    // Create tags list
    this.#tags = document.createElement("div");
    this.#tags.className = "tags input-element-tags";

    // Create input element
    this.#input = this._primaryInput = document.createElement("input");
    this.#input.type = "text";
    this.#input.placeholder = "Website";

    // Create button
    this.#button = document.createElement("button");
    this.#button.type = "button";
    this.#button.className = `icon ${makeIconClass("plus", "button")}`;
    this.#button.dataset.tooltip = "Add Website";
    this.#button.setAttribute("aria-label", this.#button.dataset.tooltip);
    return [this.#tags, this.#input, this.#button];
  }

  /** @override */
  _getValue() {
    const urls = Object.keys(this._value);
    if (this.single) return urls[0] ?? null;
    else return urls;
  }

  /**
   * Initialize innerText or an initial value attribute of the element as a serialized JSON array.
   * @param {string[]} [values]  An array of website URLs to initialize the element with.
   * @protected
   */
  _initializeTags(values) {
    let tags = [];
    if (Array.isArray(values)) tags = values;
    else {
      const initial = this.getAttribute("value") || this.innerText || "";
      if (initial) tags = initial.split(",");
    }
    for (const t of tags) {
      try {
        this.#add(t);
      } catch {
        this._value[t] = `${t} [INVALID]`;
      }
    }
    this.innerText = "";
    this.removeAttribute("value");
  }

  /** @override */
  _refresh() {
    if (!this.#tags) return; // Not yet connected
    const tags = Object.entries(this._value).map(([k, v]) =>
      this.constructor.renderTag(k, v, this.editable),
    );
    this.#tags.replaceChildren(...tags);
  }

  /** @override */
  _setValue(value) {
    this._value = {};
    if (!value) return;
    if (typeof value === "string") value = [value];
    for (const url of value) this.#add(url);
  }

  /** @override */
  _toggleDisabled(disabled) {
    this.#input.disabled = disabled;
    this.#button.disabled = disabled;
  }
}
