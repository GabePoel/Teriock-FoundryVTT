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
    /**
     * Toggle the collapse state of a collapsible element.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @this {BaseApplication}
     * @returns {Promise<void>}
     */
    static async #onToggleCollapse(event, target) {
      event.stopPropagation();
      if (event.target instanceof Element && event.target.closest("[data-collapsible-ignore]")) { return; }
      const collapsibleId = target.dataset.collapsibleTarget
        ?? target.closest(".collapsible[data-collapsible-id]")?.dataset.collapsibleId;
      if (!collapsibleId) { return; }
      this._toggleCollapsed(collapsibleId);
    }

    /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: {
        toggleCollapse: this.#onToggleCollapse,
        toggleCollapseRightClick: { buttons: [2], handler: this.#onToggleCollapse },
      },
      classes: ["teriock"],
    };

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

    /**
     * Internal map of states of collapsible elements to persist between renders.
     * @type {Map<string, boolean>}
     */
    #collapsibleElements = new Map();

    /**
     * Apply a tracked collapse to every `.collapsible` element and every toggle control (`[data-collapsible-target]`)
     * sharing the same `collapsible-id` are updated so they stay in sync.
     * @param {string} collapsibleId
     * @param {boolean} collapsed
     * @param {ParentNode} [element]
     */
    #applyCollapsibleState(collapsibleId, collapsed, element = this.element) {
      for (const el of element.querySelectorAll(".collapsible[data-collapsible-id]")) {
        if (el.dataset.collapsibleId !== collapsibleId) { continue; }
        el.classList.toggle("collapsed", collapsed);
        el.dataset.noAutoToggle = "true";
      }
      for (const control of element.querySelectorAll(`[data-collapsible-target=${collapsibleId}]`)) {
        control.classList.toggle("collapse-toggle-open", !collapsed);
      }
    }

    /**
     * States of collapsible elements, keyed by `data-collapsible-id`. A `true` value means collapsed.
     * @type {Map<string, boolean>}
     */
    get collapsibleElements() {
      return this.#collapsibleElements;
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

    /**
     * Re-apply every tracked collapsible state.
     * @param {ParentNode} [element]
     */
    _reapplyCollapsibleSates(element = this.element) {
      for (const [collapsibleId, collapsed] of this.#collapsibleElements) {
        this.#applyCollapsibleState(collapsibleId, collapsed, element);
      }
    }

    /** @inheritDoc */
    _replaceHTML(result, content, options) {
      const roots = result instanceof Element
        ? [result]
        : Object.values(result ?? {}).filter(node => node instanceof Element);
      for (const root of roots) { this._reapplyCollapsibleSates(root); }
      super._replaceHTML(result, content, options);
    }

    /**
     * Toggle the collapse state of a collapsible element.
     * @param {string} collapsibleId
     * @param {boolean} [collapsed]
     */
    _toggleCollapsed(collapsibleId, collapsed) {
      collapsed ??=
        !(this.collapsibleElements.has(collapsibleId)
          ? this.collapsibleElements.get(collapsibleId)
          : this.element.querySelector(`.collapsible[data-collapsible-id=${collapsibleId}]`)?.classList.contains(
            "collapsed",
          ));
      this.collapsibleElements.set(collapsibleId, collapsed);
      if (this.element) { this.#applyCollapsibleState(collapsibleId, collapsed, this.element); }
    }
  }

  return BaseApplication;
}
