const { AbstractFormInputElement } = foundry.applications.elements;
const { setInputAttributes } = foundry.applications.fields;

/**
 * @import { FormInputConfig } from "@common/data/_types.mjs";
 */

/**
 * @typedef UnitInputConfig
 * @property {string[]} finite - Finite units.
 * @property {HTMLElement} raw - Raw input.
 * @property {HTMLSelectElement} unit - Unit input.
 */

/**
 * Inputs for a unit model's raw value and unit. The reason this exists is to display the two side-by-side and also hide
 * the raw value when the unit isn't finite.
 * @extends {AbstractFormInputElement<{ raw: number|string|null, unit: string }>}
 */
export default class HTMLUnitInputElement extends AbstractFormInputElement {
  /** @inheritDoc */
  static tagName = "unit-input";

  /**
   * Create an HTMLUnitInputElement using provided configuration data.
   * @param {FormInputConfig<object> & UnitInputConfig} config
   * @returns {HTMLUnitInputElement}
   */
  static create(config) {
    const el = document.createElement(this.tagName);
    el.setAttribute("finite", config.finite.join(" "));
    setInputAttributes(el, config);
    for (const input of [config.raw, config.unit]) { input.removeAttribute("name"); }
    el.append(config.raw, config.unit);
    return el;
  }

  /** @type {HTMLElement} */
  #raw;

  /** @type {HTMLSelectElement} */
  #unit;

  /** @inheritDoc */
  _activateListeners() {
    this.#unit.addEventListener("change", () => this._refresh(), { signal: this.abortSignal });
  }

  /** @inheritDoc */
  _buildElements() {
    this.#raw = this.firstElementChild;
    this.#unit = this.lastElementChild;
    return [this.#raw, this.#unit];
  }

  /** @inheritDoc */
  _getValue() {
    const raw = this.#raw?.value ?? null;
    return { raw: this.#raw?.type === "number" ? (raw === "" ? null : Number(raw)) : raw, unit: this.#unit?.value };
  }

  /** @inheritDoc */
  _refresh() {
    if (!this.#raw) { return; }
    this.#raw.hidden = !this.getAttribute("finite")?.split(" ").includes(this.#unit.value);
    this._primaryInput = this.#raw.hidden ? this.#unit : this.#raw;
  }

  /** @inheritDoc */
  _setValue(value) {
    if (value?.raw !== undefined) { this.#raw.value = value.raw ?? ""; }
    if (value?.unit !== undefined) { this.#unit.value = value.unit; }
  }

  /** @inheritDoc */
  _toggleDisabled(disabled) {
    this.#raw?.toggleAttribute("disabled", disabled);
    this.#unit?.toggleAttribute("disabled", disabled);
  }
}
