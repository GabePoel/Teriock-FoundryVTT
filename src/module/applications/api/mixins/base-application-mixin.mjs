/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { ApplicationV2 } from "@client/applications/api/_module.mjs";
 */

/**
 * Mixin to ensure that `TERIOCK` values are always available.
 * @template {Constructor<ApplicationV2>} T
 * @param {T} Base
 */
export default function BaseApplicationMixin(Base) {
  /**
   * @extends {ApplicationV2}
   * @mixin
   * @property {ApplicationConfiguration & Teriock.Application._ApplicationConfiguration} options
   */
  class BaseApplication extends Base {
    /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: {
        openDocument: this._onOpenDocument,
        toggleCollapse: this._onToggleCollapse,
        toggleCollapseRightClick: { buttons: [2], handler: this._onToggleCollapse },
      },
      classes: ["teriock"],
      teriock: { doubleClickDelay: 250 },
    };

    /**
     * Open a document.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @this {BaseApplication}
     * @returns {Promise<void>}
     */
    static async _onOpenDocument(event, target) {
      event.stopPropagation();
      if (target.dataset.uuid) {
        const document = await foundry.utils.fromUuid(target.dataset.uuid);
        await document?.sheet?.render(true);
      }
    }

    /**
     * Toggle the collapse state of a collapsible element.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @this {BaseApplication}
     * @returns {Promise<void>}
     */
    static async _onToggleCollapse(event, target) {
      event.stopPropagation();
      if (event.target instanceof Element && event.target.closest("[data-collapsible-ignore]")) { return; }
      const collapsibleId = this._getCollapsibleId(target);
      if (collapsibleId) { this._toggleCollapsed(collapsibleId, undefined, target); }
    }

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
    #collapsibleStates = new Map();

    /**
     * Internal map of context menus so they can safely be called in `_onRender`.
     * @type {Map<string, {container: HTMLElement, menu: TeriockContextMenu}>}
     */
    #contextMenus = new Map();

    /**
     * Internal tracking of detached state.
     * @type {boolean}
     */
    #detached = this.window?.windowId === this.id;

    /**
     * Timeout ID of a click that is being held back in case it becomes a double click.
     * @type {number}
     */
    #pendingClick;

    /**
     * Internal map of scroll positions to persist between renders.
     * @type {Map<string, {left: number, top: number}>}
     */
    #scrollPositions = new Map();

    /**
     * Apply a tracked collapse to every `.collapsible` element and every toggle control (`[data-collapsible-target]`)
     * sharing the same `collapsible-id` so they stay in sync.
     * @param {string} collapsibleId
     * @param {boolean} collapsed
     * @param {ParentNode} [root]
     */
    #applyCollapsibleState(collapsibleId, collapsed, root = this.element) {
      this.#collapsibleStates.set(collapsibleId, collapsed);
      for (const el of findMatchingElements(root, `.collapsible[data-collapsible-id="${collapsibleId}"]`)) {
        el.classList.toggle("collapsed", collapsed);
      }
      for (const control of findMatchingElements(root, `[data-collapsible-target="${collapsibleId}"]`)) {
        control.classList.toggle("collapse-toggle-open", !collapsed);
      }
    }

    /**
     * Pause a click on an element with both `data-action` and `data-double`.
     * @param {PointerEvent} event
     */
    #onClickCapture(event) {
      if (!event.isTrusted || event.button !== 0) { return; }
      const target = /** @type {HTMLElement} */ (event.target);
      if (!target.closest?.("[data-action][data-double]")) { return; }
      event.stopPropagation();
      window.clearTimeout(this.#pendingClick);
      if (event.detail > 1) { return; }
      this.#pendingClick = window.setTimeout(
        () => target.dispatchEvent(new PointerEvent("click", event)),
        this.options.teriock?.doubleClickDelay,
      );
    }

    /**
     * Dispatch a double click to a registered `doubles` handler.
     * @param {MouseEvent} event
     */
    #onDoubleClick(event) {
      window.clearTimeout(this.#pendingClick);
      const target = /** @type {HTMLElement} */ (event.target).closest("[data-double]");
      if (!target || target.closest(".window-header")) { return; }
      const handler = this.options.doubles?.[target.dataset.double];
      if (handler) { handler.call(this, event, target); }
      else { this._onDoubleClickAction(event, target); }
    }

    /**
     * Whether this application is detached.
     * @returns {boolean}
     */
    get isDetached() {
      return this.#detached;
    }

    /**
     * Assign undeclared scrollable ids onto elements whose scroll should persist between renders.
     * @param {ParentNode} [root]
     */
    _assignScrollableIds(root = this.element) {
      for (const editor of root.querySelectorAll("prose-mirror[name]")) {
        editor.dataset.scrollableId ??= editor.getAttribute("name");
      }
    }

    /** @inheritDoc */
    _attachFrameListeners() {
      super._attachFrameListeners();
      this.element.addEventListener("keydown", this._onPressKey.bind(this));
      this.element.addEventListener("dblclick", this.#onDoubleClick.bind(this));
      this.element.addEventListener("click", this.#onClickCapture.bind(this), { capture: true });
    }

    /**
     * Capture the scroll position of every scrollable element with an id.
     * @param {ParentNode} [root]
     */
    _captureScrollPositions(root = this.element) {
      for (const el of findMatchingElements(root, "[data-scrollable-id]")) {
        this.#scrollPositions.set(el.dataset.scrollableId, { left: el.scrollLeft, top: el.scrollTop });
      }
    }

    /**
     * @inheritDoc
     * @returns {TeriockContextMenu|null}
     */
    _createContextMenu(handler, selector, options = {}) {
      const container = options.container ?? this.element;
      const key = `${options.eventName ?? "contextmenu"}:${selector}`;
      const existing = this.#contextMenus.get(key);
      if (existing?.container === container) { return existing.menu; }
      const menu = super._createContextMenu(handler, selector, options);
      if (menu) { this.#contextMenus.set(key, { container, menu }); }
      else { this.#contextMenus.delete(key); }
      return menu;
    }

    /**
     * Get the collapsible ID from an HTML element.
     * @param {HTMLElement} htmlElement
     * @returns {string|null}
     */
    _getCollapsibleId(htmlElement) {
      return htmlElement.dataset.collapsibleTarget
        ?? htmlElement.closest(".collapsible[data-collapsible-id]")?.dataset.collapsibleId ?? null;
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
      this.element.querySelectorAll("[data-disable]").forEach(el => {
        const state = el.dataset.disable;
        if (state === "true") {
          el.disabled = true;
          if (el.tagName === "IMG") { el.classList.remove("disabled"); }
        }
        if (state === "false") {
          el.disabled = false;
          if (el.tagName === "IMG") { el.classList.add("disabled"); }
        }
        el.disabled = el.dataset.disable === "true";
      });
      this.element.querySelectorAll("[data-no-scroll]").forEach(el =>
        el.addEventListener("wheel", ev => ev.preventDefault())
      );
      this._syncSpinnerAnimations();
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      return Object.assign(await super._prepareContext(options), { appId: this.id, TERIOCK });
    }

    /** @inheritDoc */
    async _preRender(context, options) {
      await game.teriock.templatesReady;
      return super._preRender(context, options);
    }

    /**
     * Re-apply every tracked collapsible state.
     * @param {ParentNode} [element]
     */
    _reapplyCollapsibleSates(element = this.element) {
      for (const [collapsibleId, collapsed] of this.#collapsibleStates) {
        this.#applyCollapsibleState(collapsibleId, collapsed, element);
      }
      this._reapplyScrollPositions(element);
      this._syncSpinnerAnimations(element);
    }

    /**
     * Re-apply every tracked scroll position.
     * @param {ParentNode} [root]
     */
    _reapplyScrollPositions(root = this.element) {
      if (!root.isConnected) { return; }
      for (const el of findMatchingElements(root, "[data-scrollable-id]")) {
        const pos = this.#scrollPositions.get(el.dataset.scrollableId);
        if (pos) {
          el.scrollLeft = pos.left;
          el.scrollTop = pos.top;
        }
      }
    }

    /** @inheritDoc */
    _replaceHTML(result, content, options) {
      this._captureScrollPositions(content);
      const roots = result instanceof Element
        ? [result]
        : Object.values(result ?? {}).filter(node => node instanceof Element);
      for (const root of roots) { this._reapplyCollapsibleSates(root); }
      super._replaceHTML(result, content, options);
      this._assignScrollableIds(content);
      this._reapplyCollapsibleSates(content);
    }

    /**
     * Synchronize every Elder Sorcery spin animation.
     * @param {ParentNode} [root]
     */
    _syncSpinnerAnimations(root = this.element) {
      if (!(root instanceof Element) || !root.isConnected) { return; }
      for (const animation of root.getAnimations({ subtree: true })) {
        if (animation.animationName === "spin-offset" && animation.startTime !== 0) { animation.startTime = 0; }
      }
    }

    /** @inheritDoc */
    _tearDown(options) {
      super._tearDown(options);
      this.#contextMenus.clear();
    }

    /**
     * Toggle the collapse state of a collapsible element.
     * @param {string} collapsibleId
     * @param {boolean} [collapsed]
     * @param {HTMLElement} [target]
     * @returns {boolean} - Final collapsed state.
     */
    _toggleCollapsed(collapsibleId, collapsed, target) {
      const root = (target instanceof Element && !this.element.contains(target)) ? target.getRootNode() : this.element;
      collapsed ??=
        !(this.#collapsibleStates.has(collapsibleId)
          ? this.#collapsibleStates.get(collapsibleId)
          : root.querySelector(`.collapsible[data-collapsible-id="${collapsibleId}"]`)?.classList.contains(
            "collapsed",
          ));
      this.#applyCollapsibleState(collapsibleId, collapsed, root);
      return collapsed;
    }

    /** @inheritDoc */
    attachWindow(options = {}) {
      this.#detached = false;
      return super.attachWindow(options);
    }

    /** @inheritDoc */
    detachWindow(options = {}) {
      this.#detached = true;
      return super.detachWindow(options);
    }
  }

  return BaseApplication;
}

/**
 * Elements matching the selector including the root.
 * @param {ParentNode} root
 * @param {string} selector
 * @returns {HTMLElement[]}
 */
function findMatchingElements(root, selector) {
  const matches = [];
  if (root instanceof Element && root.matches(selector)) { matches.push(root); }
  matches.push(...root.querySelectorAll(selector));
  return matches;
}
