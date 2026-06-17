import TeriockBaseApplication from "./base-application.mjs";

/**
 * A custom application representing something that needs to be resolved before some routing can continue.
 */
export default class TeriockResolvableDialog extends TeriockBaseApplication {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    actions: { cancel: this._onCancel },
    classes: ["dialog"],
    window: { contentClasses: ["standard-form"], resizable: false },
  };

  /**
   * @param {PointerEvent} event
   * @returns {Promise<void>}
   * @this {TeriockResolvableDialog}
   */
  static async _onCancel(event) {
    event?.preventDefault();
    this._finish(this._fallbackFinishValue);
    await this.close();
  }

  /**
   * Show the dialog and wait for interaction to complete.
   * @param {*} args
   * @returns {Promise<*>}
   */
  static async prompt(...args) {
    const app = await this.create(...args);
    return app._result;
  }

  /**
   * @param {Partial<ApplicationConfiguration>} [config]
   */
  constructor(config = {}) {
    super(config);
    this._resolve = null;
    this._result = new Promise(resolve => (this._resolve = resolve));
  }

  /**
   * A default value sent to the finishing promise.
   * @returns {*}
   */
  get _fallbackFinishValue() {
    return null;
  }

  /**
   * Resolve the dialog promise.
   * @param {*} value
   */
  _finish(value) {
    if (this._resolve) {
      const resolve = this._resolve;
      this._resolve = null;
      resolve(value);
    }
  }

  /** @inheritDoc */
  _onClose() {
    super._onClose();
    this._finish(this._fallbackFinishValue);
  }
}
