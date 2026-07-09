/**
 * Mixin to ensure that `TERIOCK` values are always available.
 * @param {typeof ApplicationV2} Base
 */
export default function BaseApplicationMixin(Base) {
  /**
   * @extends {ApplicationV2}
   * @mixin
   */
  class BaseApplication extends Base {
    /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = { classes: ["teriock"] };

    /**
     * Make and immediately show this application.
     * @param {*} args
     * @returns {Promise<InstanceType<this>>}
     */
    static async create(...args) {
      const app = new this(...args);
      await app.render(true);
      return app;
    }

    /** @inheritDoc */
    _attachFrameListeners() {
      super._attachFrameListeners();
      this.element.addEventListener("keydown", this._onPressKey.bind(this));
      this.element.addEventListener("dblclick", this._dispatchDoubleClick.bind(this));
    }

    /**
     * Dispatch a double click to a registered `doubles` handler.
     * @param {MouseEvent} event
     */
    _dispatchDoubleClick(event) {
      const target = /** @type {HTMLElement} */ (event.target).closest("[data-double]");
      if (!target || target.closest(".window-header")) { return; }
      const handler = this.options.doubles?.[target.dataset.double];
      if (handler) { handler.call(this, event, target); }
      else { this._onDoubleClickAction(event, target); }
    }

    /**
     * A generic event handler for double-clicks which can be extended by subclasses.
     * Handlers defined in {@link Teriock.Application._ApplicationConfiguration.doubles} are called first.
     * This method is only called for `data-double` values that have no defined handler.
     * @param {MouseEvent} _event
     * @param {HTMLElement} _target
     */
    _onDoubleClickAction(_event, _target) {}

    /**
     * Handle keypresses within the application.
     * @param {KeyboardEvent} _event
     */
    _onPressKey(_event) {}

    /** @inheritDoc */
    async _onRender(context, options = {}) {
      await super._onRender(context, options);
      this.element.querySelectorAll("[data-never-disable]").forEach(
        /** @param {HTMLButtonElement|HTMLInputElement} e */
        e => (e.disabled = false),
      );
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      return Object.assign(await super._prepareContext(options), { appId: this.id, TERIOCK });
    }
  }
  return BaseApplication;
}
