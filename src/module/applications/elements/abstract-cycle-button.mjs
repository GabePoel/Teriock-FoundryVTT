const { AbstractFormInputElement } = foundry.applications.elements;

/**
 * Abstract button control that steps through a fixed cycle of values.
 * Left-click cycles forward. Subclasses define the cycle via {@link AbstractCycleButtonElement.ORDER}.
 */
export default class AbstractCycleButtonElement extends AbstractFormInputElement {
  /**
   * Cycle order for left-click.
   * @type {Array<boolean|null>}
   */
  static ORDER = [];

  /**
   * Update what's shown on the primary button.
   */
  #updateDisplay() {
    if (this._primaryInput) { this._primaryInput.value = String(this._value); }
  }

  /** @inheritDoc */
  _activateListeners() {
    this._primaryInput.addEventListener("click", () => this._step(1));
    // Left-click on associated labels are forwarded by the browser.
    this.addEventListener("click", (event) => {
      if (!this._primaryInput.contains(event.target)) { this._step(1); }
    });
  }

  /** @inheritDoc */
  _buildElements() {
    this._primaryInput = document.createElement("button");
    this._primaryInput.type = "button";
    return [this._primaryInput];
  }

  /** @inheritDoc */
  _refresh() {
    const attr = this.getAttribute("value");
    if (attr !== null) {
      this._setValue(attr);
      this.removeAttribute("value");
    }
    this.#updateDisplay();
  }

  /**
   * Step through the cycle in the given direction.
   * @param {-1|1} direction
   */
  _step(direction) {
    if (this.disabled) { return; }
    const order = this.constructor.ORDER;
    const idx = order.indexOf(this._value);
    this._value = order[(idx + order.length + direction) % order.length];
    this.#updateDisplay();
    this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  }

  /** @inheritDoc */
  _toggleDisabled(disabled) {
    if (this._primaryInput) { this._primaryInput.disabled = disabled; }
  }
}
