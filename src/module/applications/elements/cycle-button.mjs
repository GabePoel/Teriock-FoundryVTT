const { AbstractFormInputElement } = foundry.applications.elements;

/**
 * Abstract button control that steps through a fixed cycle of values.
 * Left-click cycles forward. Subclasses define the cycle via {@link HTMLCycleButtonElement.ORDER}.
 * @extends {AbstractFormInputElement}
 */
export default class HTMLCycleButtonElement extends AbstractFormInputElement {
  /**
   * Cycle order for left-click.
   * @type {Array<boolean|null>}
   */
  static ORDER = [];

  /** @type {HTMLButtonElement} */
  _button;

  /** @inheritDoc */
  _activateListeners() {
    this._button.addEventListener("click", () => this._step(1));
    // Left-click on associated labels are forwarded by the browser.
    this.addEventListener("click", (event) => {
      if (!this._button.contains(event.target)) { this._step(1); }
    });
  }

  /** @inheritDoc */
  _buildElements() {
    this._button = this._primaryInput = document.createElement("button");
    this._button.type = "button";
    return [this._button];
  }

  /** @inheritDoc */
  _refresh() {
    const attr = this.getAttribute("value");
    if (attr !== null) {
      this._setValue(attr);
      this.removeAttribute("value");
    }
    this._updateDisplay();
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
    this._updateDisplay();
    this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  }

  /** @inheritDoc */
  _toggleDisabled(disabled) {
    if (this._button) { this._button.disabled = disabled; }
  }

  _updateDisplay() {
    if (this._button) { this._button.value = String(this._value); }
  }
}
