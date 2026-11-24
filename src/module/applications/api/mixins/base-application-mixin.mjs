/**
 * @import { ApplicationConfiguration, ApplicationHeaderControlsEntry, ApplicationRenderOptions } from "@client/applications/_types.mjs";
 * @import { ApplicationV2, DocumentSheetV2 } from "@client/applications/api/_module.mjs";
 */

/**
 * Mixin to ensure that `TERIOCK` values are always available.
 * @template {MixinBase<typeof ApplicationV2>} T
 * @param {T} Base
 */
export default function BaseApplicationMixin(Base) {
  /**
   * @mixin
   * @property {ApplicationConfiguration & Teriock.Application._ApplicationConfiguration} options
   */
  class BaseApplication extends Base {
    /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: {
        openDocument: this._onOpenDocument,
        openInfo: this._onOpenInfo,
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
        const uuid = target.dataset.uuid;
        const document = await (this.document?.fetchFromUuid?.(uuid) ?? foundry.utils.fromUuid(uuid));
        await document?.sheet?.render(true);
      }
    }

    /**
     * Open the document corresponding to an info icon.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @this {BaseApplication}
     * @returns {Promise<void>}
     */
    static async _onOpenInfo(event, target) {
      const uuid = target.dataset.tooltipUuid || game.teriock.identifiers.get(target.dataset.tooltipIdentifier);
      if (!uuid) { return; }
      const doc = await (this.document?.fetchFromUuid?.(uuid) ?? fromUuid(uuid));
      if (doc) { doc._onClickDocumentLink(event); }
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
      let parentApp;
      // TODO: More careful options handling in one object ideally
      for (const a of args) { parentApp ??= a.parentApp; }
      if (parentApp) {
        await parentApp.renderChild(app);
        app.setPosition({
          height: Math.min(app.position.height, parentApp.position.height),
          width: Math.min(app.position.width, parentApp.position.width),
        });
      } else { await app.render(true); }
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
     * Tokens hovered through an element's `data-uuid`.
     * @type {TeriockToken[]}
     */
    #hoveredTokens = [];

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

    /** Point vertical tab tooltips away from the screen edge. */
    #applyVerticalTabsDirection() {
      for (const el of this.element.querySelectorAll(".teriock-vertical-tabs")) {
        el.dataset.tooltipDirection = this.isDetached ? "LEFT" : "RIGHT";
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
     * Suppress default context menus for elements that have a right click button.
     * @param {MouseEvent} event
     */
    #suppressContextMenu(event) {
      const target = /** @type {HTMLElement} */ event.target.closest("[data-action]");
      const action = target && this.options.actions[target.dataset.action];
      if (action?.suppressContextMenu || event.target.closest("[data-suppress-context-menu]")) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }

    /**
     * Tokens hovered through an element's `data-uuid`.
     * @returns {TeriockToken[]}
     */
    get hoveredTokens() {
      return this.#hoveredTokens;
    }

    /**
     * Whether this application is detached.
     * @returns {boolean}
     */
    get isDetached() {
      return Boolean(this.window?.windowId);
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
      this._attachRootListeners(this.element);
    }

    /**
     * Attach listeners to a root element.
     * @param {HTMLElement} root
     */
    _attachRootListeners(root) {
      root.addEventListener("keydown", this._onPressKey.bind(this));
      root.addEventListener("dblclick", this.#onDoubleClick.bind(this));
      root.addEventListener("click", this.#onClickCapture.bind(this), { capture: true });
      root.addEventListener("contextmenu", this.#suppressContextMenu.bind(this));
      root.addEventListener("pointerover", this._onUuidHoverIn.bind(this), { passive: true });
      root.addEventListener("pointerout", this._onUuidHoverOut.bind(this), { passive: true });
      root.addEventListener("wheel", event => {
        if (event.target.closest?.("[data-no-scroll]")) { event.preventDefault(); }
      }, { passive: false });
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

    /** @inheritDoc */
    _onAttach(from, to) {
      super._onAttach(from, to);
      this.#applyVerticalTabsDirection();
    }

    /** @inheritDoc */
    _onDetach(from, to) {
      super._onDetach(from, to);
      this.#applyVerticalTabsDirection();
      // Resize application to deal with space caused by vertical tabs floating outside it.
      if (!this.options.window.resizable || this.window.windowId !== this.id) { return; }
      this.setPosition({ height: to.documentElement.clientHeight, width: to.documentElement.clientWidth });
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
        el.disabled = el.dataset.disable === "true";
        if (el.tagName === "IMG") { el.classList.toggle("disabled", el.disabled); }
      });
      this.#applyVerticalTabsDirection();
      this._syncSpinnerAnimations();
    }

    /**
     * Hover the tokens of an element whose `data-uuid` is a Token, Combatant, or CombatantGroup as if on the canvas.
     * @param {PointerEvent} event
     */
    _onUuidHoverIn(event) {
      const uuid = event.target.closest?.("[data-uuid]")?.dataset.uuid;
      const type = foundry.utils.parseUuid(uuid)?.type;
      if (!canvas.ready || !["Combatant", "CombatantGroup", "Token"].includes(type)) { return; }
      const doc = fromUuidSync(uuid, { strict: false });
      const combatants = type === "CombatantGroup" ? [...(doc?.members ?? [])] : [doc];
      const tokens = type === "Token" ? [doc] : combatants.filter(c => c?.visible).map(c => c.token);
      this.#hoveredTokens = tokens.map(t => t?.object).filter(t => t?.visible && t._canHover(game.user, event));
      this.#hoveredTokens.forEach((token, i) => token._onHoverIn(event, { hoverOutOthers: i === 0 }));
    }

    /**
     * Release the tokens hovered through an element's `data-uuid`.
     * @param {PointerEvent} event
     */
    _onUuidHoverOut(event) {
      for (const token of this.#hoveredTokens) { token._onHoverOut(event); }
      this.#hoveredTokens = [];
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
    _reapplyCollapsibleStates(element = this.element) {
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
      for (const root of roots) { this._reapplyCollapsibleStates(root); }
      super._replaceHTML(result, content, options);
      this._assignScrollableIds(content);
      this._reapplyCollapsibleStates(content);
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

/**
 * Adds a right-click option to the close button in all applications.
 * @param {ApplicationV2|DocumentSheetV2|ExecutionEditor} application
 * @param {HTMLElement} _element
 * @param {object} _context
 * @param {ApplicationRenderOptions} options
 * @see {renderApplicationV2}
 */
function addApplicationDebugListener(application, _element, _context, options) {
  if (!options.isFirstRender || !application.window.header) { return; }
  application.window.header.addEventListener("contextmenu", async e => {
    if (!e.target.closest("[data-action=close]") || !game.settings.get("teriock", "developerMode")) { return; }
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    console.warn("Debug Application:");
    console.log("Application", application);
    if (application.execution) {
      console.log("Execution", application.execution);
    }
    if (application.document) {
      console.log("Document", application.document);
      if (typeof application.document.getRollData === "function") {
        console.log("Roll Data", application.document.getRollData());
      }
    }
    if (typeof application._prepareContext === "function") {
      const context = await application._prepareContext({ force: false, isFirstRender: false });
      console.log("Context", context);
    }
  }, { capture: true });
}
Hooks.on("renderApplicationV2", addApplicationDebugListener);

/**
 * Sort the document header control document sheets to be alphabetical. Modules might still break this though...
 * @param {ApplicationV2} application
 * @param {ApplicationHeaderControlsEntry[]} controls
 * @see {getHeaderControlsApplicationV2}
 */
function sortControls(application, controls) {
  const teriock = application.options.classes?.includes("teriock")
    || typeof application.document?.getEmbedContextMenuEntries === "function";
  if (!teriock) { return; }
  for (const c of controls) { c.label = _loc(c.label); }
  controls = game.i18n.sortObjects(controls, "label");
  controls.sort((a, b) => {
    const getOrder = control => {
      if (control.action === "attach") { return 1; }
      if (control.action === "detach") { return 2; }
      if (control.icon?.includes("delete")) { return 4; }
      return 3;
    };
    return getOrder(a) - getOrder(b);
  });
}
Hooks.on("getHeaderControlsApplicationV2", sortControls);
