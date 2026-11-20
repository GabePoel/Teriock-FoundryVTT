const { DragDrop } = foundry.applications.ux;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * Mixin adding drag-and-drop handling to applications.
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function DragDropApplicationMixin(Base) {
  /**
   * @mixes BaseApplication
   * @mixin
   * @property {ApplicationConfiguration & Teriock.Application._ApplicationConfiguration} options
   */
  class DragDropApplication extends Base {
    /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = {
      teriock: {
        dragDrop: {
          bind: { dragEnter: true, dragLeave: true, dragOver: true, dragStart: true, drop: true },
          dropBehavior: { child: false, effect: "none", inherit: false },
          selectors: { drag: ".draggable", drop: null, sort: "[data-uuid]" },
          style: {
            dropTargetClass: "teriock-drop-target",
            maximizeOnDragEnter: false,
            minimizeOnDragStart: false,
            styleDropTarget: false,
          },
        },
      },
    };

    /** @type {DragDrop} */
    #dragDrop = null;

    /** @type {boolean} */
    #dragIsInApplication = false;

    /** @type {boolean} */
    #minimizeOnDragLeave = false;

    /** @type {Map<string, string|null>} */
    #tabsBeforeDrag = new Map();

    /** @type {boolean|null} */
    #wasMinimizedBeforeDragEnter = null;

    /** @type {boolean|null} */
    #wasMinimizedBeforeDragStart = null;

    /**
     * Whether this should maximize on drag enter.
     * @returns {boolean}
     */
    get #shouldMaximizeOnDragEnter() {
      return game.settings.get("teriock", "maximizeApplicationsOnDragEnter")
        && this.options.teriock.dragDrop.style.maximizeOnDragEnter && this.hasFrame && !this.isDetached;
    }

    /**
     * Whether this should minimize on drag start.
     * @returns {boolean}
     */
    get #shouldMinimizeOnDragStart() {
      return game.settings.get("teriock", "minimizeApplicationsOnDragStart")
        && this.options.teriock.dragDrop.style.minimizeOnDragStart && this.hasFrame && !this.isDetached;
    }

    /**
     * The entry being sorted, along with where it started.
     * @type {{ element: HTMLElement, next: Element|null, parent: HTMLElement }|null}
     */
    _sortSource = null;

    /**
     * Return a cached copy of a DragDrop instance.
     * @returns {DragDrop}
     */
    get _dragDrop() {
      return this.#dragDrop ??= new DragDrop.implementation({
        callbacks: {
          dragenter: this.options.teriock.dragDrop.bind.dragEnter ? this._onDragEnter.bind(this) : undefined,
          dragleave: this.options.teriock.dragDrop.bind.dragLeave ? this._onDragLeave.bind(this) : undefined,
          dragover: this.options.teriock.dragDrop.bind.dragOver ? this._onDragOver.bind(this) : undefined,
          dragstart: this.options.teriock.dragDrop.bind.dragStart ? this._onDragStart.bind(this) : undefined,
          drop: this.options.teriock.dragDrop.bind.drop ? this._onDrop.bind(this) : undefined,
        },
        dragSelector: this._dragSelector,
        dropSelector: this._dropSelector,
        permissions: { dragstart: this._canDragStart.bind(this), drop: this._canDragDrop.bind(this) },
      });
    }

    /**
     * Selected for intended drag target.
     * @returns {string|null}
     */
    get _dragSelector() {
      return this.options.teriock.dragDrop.selectors.drag;
    }

    /**
     * Selector for intended drop target.
     * @returns {string|null} Return is `null` if the whole application is a drop target.
     */
    get _dropSelector() {
      return this.options.teriock.dragDrop.selectors.drop;
    }

    /**
     * What gets marked as where a drop would land.
     * @returns {HTMLElement|null}
     */
    get _dropTargetElement() {
      return this.window.content;
    }

    /**
     * Checks if a drop is allowed when the drag handlers are bound rather than during a drag. Use {@link _dropEffect}
     * to check during a drag.
     * @returns {boolean}
     */
    _canDragDrop() {
      return true;
    }

    /**
     * Checks if drag start is allowed.
     * @param {string} _selector
     * @returns {boolean}
     */
    _canDragStart(_selector) {
      return true;
    }

    /**
     * Checks if entries can be sorted.
     * @returns {boolean}
     */
    _canSort() {
      return true;
    }

    /**
     * What a drop onto this application would do.
     * @param {DragEvent} _event
     * @returns {Teriock.Application.DropEffect}
     */
    _dropEffect(_event) {
      if (this._sortSource) { return this._sortSource.element.isConnected ? "move" : "none"; }
      return this.options.teriock.dragDrop.dropBehavior.effect;
    }

    /**
     * A field element under the cursor that handles drops itself. This is independent of whether the application as a
     * whole is a valid drop target.
     * @param {DragEvent} event
     * @returns {HTMLElement|null}
     */
    _fieldDropTarget(event) {
      const field = event.target instanceof Element
        ? event.target.closest("identifier-tags, document-tags, prose-mirror")
        : null;
      if (!field || field.disabled || (field.tagName === "PROSE-MIRROR" && !field.open)) { return null; }
      return field;
    }

    /**
     * Handles cleanup after a drag that started from this application ends.
     * @param {DragEvent} _event
     * @returns {Promise<void>}
     */
    async _onDragEnd(_event) {
      // A drag that didn't sort just puts the entry back where it started.
      if (this._sortSource) {
        const { element, next, parent } = this._sortSource;
        element.classList.remove("teriock-sort-placeholder");
        if (!next || next.parentElement === parent) { parent.insertBefore(element, next); }
        this._sortSource = null;
      }
      this.#dragIsInApplication = false;
      this.#minimizeOnDragLeave = false;
      this.bringToFront();
      if (this.#shouldMinimizeOnDragStart && !this.#wasMinimizedBeforeDragStart) { await this.maximize(); }
    }

    /**
     * Handles drag enter events.
     * @param {DragEvent} event
     * @returns {Promise<void>}
     */
    async _onDragEnter(event) {
      if (this.#dragIsInApplication) { return; }
      DragDrop.implementation.enterApplication(this, event);
    }

    /**
     * Handles drag enter events when they first enter the application.
     * @param {DragEvent} event
     * @returns {Promise<void>}
     */
    async _onDragEnterApplication(event) {
      this.#dragIsInApplication = true;
      if (this._dropEffect(event) === "none" && !this._fieldDropTarget(event)) { return; }
      if (this.hasFrame) { this.bringToFront(); }
      if (!this.#shouldMaximizeOnDragEnter) { return; }
      this.#wasMinimizedBeforeDragEnter = this.minimized;
      if (this.#wasMinimizedBeforeDragEnter) { await this.maximize(); }
    }

    /**
     * Handles drag leave events.
     * @param {DragEvent} event
     * @returns {Promise<void>}
     */
    async _onDragLeave(event) {
      // Drag leave also fires while moving between elements within this application.
      if (event.currentTarget.contains(event.relatedTarget)) { return; }
      DragDrop.implementation.leaveApplication(this, event);
    }

    /**
     * Handles the drag leaving the application. This is also used if the drag ends somewhere outside the application.
     * @param {DragEvent} [event]
     * @returns {Promise<void>}
     */
    async _onDragLeaveApplication(event) {
      this.#dragIsInApplication = false;
      if (this.#minimizeOnDragLeave && event?.type === "dragleave") {
        // Minimize only if drag is still ongoing.
        setTimeout(() => {
          if (!this.#minimizeOnDragLeave || this.#dragIsInApplication) { return; }
          if (DragDrop.implementation.dragStartApplication !== this) { return; }
          this.#minimizeOnDragLeave = false;
          this.minimize();
        }, 100);
      }
      for (const [group, tab] of this.#tabsBeforeDrag) { if (tab) { this._safeChangeTab(tab, group); } }
      this.#tabsBeforeDrag.clear();
      if (this.options.teriock.dragDrop.style.styleDropTarget) {
        this._dropTargetElement?.classList.remove(this.options.teriock.dragDrop.style.dropTargetClass);
      }
      if (!this.#shouldMaximizeOnDragEnter) { return; }
      if (this.#wasMinimizedBeforeDragEnter) { this.minimize(); }
      this.#wasMinimizedBeforeDragEnter = null;
    }

    /**
     * Handles drag over events.
     * @param {DragEvent} event
     * @returns {Promise<void>}
     */
    async _onDragOver(event) {
      const field = this._fieldDropTarget(event);
      event.dataTransfer.dropEffect = field ? "copy" : this._dropEffect(event);
      if (this.options.teriock.dragDrop.style.styleDropTarget) {
        const marked = !field && event.dataTransfer.dropEffect !== "none"
          && DragDrop.implementation.dragStartApplication !== this;
        this._dropTargetElement?.classList.toggle(this.options.teriock.dragDrop.style.dropTargetClass, marked);
      }
      const source = this._sortSource?.element;
      if (!source || field) { return; }
      const { sort } = this.options.teriock.dragDrop.selectors;
      const hit = event.target.closest?.(`[data-sort-container], [data-sort-container] > :is(${sort})`);
      if (hit === source) { return; }
      const element = hit?.hasAttribute("data-sort-container") ? null : hit;
      const container = element?.parentElement ?? hit ?? source.parentElement;
      if (source.contains(container)) { return; }
      const group = container.dataset.sortGroup;
      if (container !== source.parentElement && (!group || group !== source.parentElement.dataset.sortGroup)) {
        return;
      }
      if (!element) {
        const entries = Array.from(container.querySelectorAll(`:scope > :is(${sort})`)).filter(el => el !== source);
        if (!entries.length) { container.prepend(source); }
        else if (event.clientY < entries[0].getBoundingClientRect().top) { entries[0].before(source); }
        else if (event.clientY > entries.at(-1).getBoundingClientRect().bottom) { entries.at(-1).after(source); }
        return;
      }
      const rect = element.getBoundingClientRect();
      const { height } = source.getBoundingClientRect();
      const follows = source.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING;
      const before = event.clientY < (follows ? rect.bottom - height : rect.top + height);
      if ((before ? element.previousElementSibling : element.nextElementSibling) === source) { return; }
      element[before ? "before" : "after"](source);
    }

    /**
     * Handles drag start events.
     * @param {DragEvent} event
     */
    _onDragStart(event) {
      if (event.dataTransfer.effectAllowed === "uninitialized") { event.dataTransfer.effectAllowed = "copy"; }
      DragDrop.implementation.dragStartApplication = this;
      if (this.#shouldMinimizeOnDragStart) { this.#wasMinimizedBeforeDragStart = this.hasFrame && this.minimized; }
      const minimize = this.#shouldMinimizeOnDragStart && !this.#wasMinimizedBeforeDragStart;
      // Special handling so that if sorting can happen within this application then we only minimize when we leave.
      const sortContainer = event.currentTarget?.closest?.("[data-sort-container]");
      if (sortContainer) { this.#minimizeOnDragLeave = minimize && !sortContainer.hasAttribute("data-sort-group"); }
      else {
        setTimeout(() => {
          if (DragDrop.implementation.dragStartApplication === this && minimize) { this.minimize(); }
        }, 100);
      }
      const uuid = event.currentTarget?.dataset?.uuid;
      if (uuid) {
        const doc = foundry.utils.fromUuidSync(uuid, { strict: false });
        const dragData = typeof doc?.toDragData === "function"
          ? doc.toDragData()
          : { type: foundry.utils.parseUuid(uuid)?.type, uuid };
        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
      }
      const handle = event.currentTarget;
      const element = handle?.closest?.(`[data-sort-container] > :is(${this.options.teriock.dragDrop.selectors.sort})`);
      if (!element || !this._canSort() || (element !== handle && element.dataset.uuid !== handle.dataset.uuid)) {
        return;
      }
      this._sortSource = { element, next: element.nextElementSibling, parent: element.parentElement };
      setTimeout(() => {
        if (this._sortSource?.element === element) { element.classList.add("teriock-sort-placeholder"); }
      });
    }

    /**
     * Handles drop events.
     * @param {DragEvent} event
     * @returns {Promise<void>}
     */
    async _onDrop(event) {
      const sortSource = this._sortSource;
      this._sortSource = null;
      sortSource?.element.classList.remove("teriock-sort-placeholder");
      this.#wasMinimizedBeforeDragEnter = false;
      this.#dragIsInApplication = false;
      this.#tabsBeforeDrag.clear();
      DragDrop.implementation.leaveApplication(this);
      if (sortSource) {
        const { element, next, parent } = sortSource;
        if (!element.isConnected || (element.parentElement === parent && element.nextElementSibling === next)) {
          return;
        }
        return this._onSortDrop(sortSource);
      }
      if (this.options.teriock.dragDrop.dropBehavior.inherit) { return super._onDrop?.(event); }
    }

    /**
     * Explains why a drag that was released over this application couldn't be dropped.
     * @param {DragEvent} _event
     * @returns {boolean} Whether the drag didn't start from this application.
     */
    _onDropRejected(_event) {
      return DragDrop.implementation.dragStartApplication !== this;
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      this._dragDrop.bind(this.element);
    }

    /**
     * Handles an entry being sorted to where it was dropped.
     * @param {{ element: HTMLElement, next: Element|null, parent: HTMLElement }} _sortSource
     * @returns {Promise<void>}
     */
    async _onSortDrop(_sortSource) {}

    /**
     * Reveal the tab a dragged document would be dropped into.
     * @param {string} tab
     * @param {string} group
     */
    _revealDragTab(tab, group) {
      if (this.tabGroups[group] === tab) { return; }
      if (!this.#tabsBeforeDrag.has(group)) { this.#tabsBeforeDrag.set(group, this.tabGroups[group]); }
      this._safeChangeTab(tab, group);
    }

    /**
     * Safely change tabs. This changes right away if possible or waits until next render if not.
     * @param {string} tab
     * @param {string} group
     */
    _safeChangeTab(tab, group) {
      if (this.tabGroups[group] === tab) { return; }
      if (this.element?.querySelector(`.tabs [data-group="${group}"][data-tab="${tab}"]`)) {
        this.changeTab(tab, group);
      } else { this.tabGroups[group] = tab; }
    }

    /** @inheritDoc */
    async maximize() {
      // Minimize/maximize in close succession from dragging/dropping can leave leftover classes.
      this.element.classList.remove("minimizing");
      await super.maximize();
      this.element.classList.remove("minimized");
    }

    /** @inheritDoc */
    async minimize() {
      // Minimize/maximize in close succession from dragging/dropping can leave leftover classes.
      this.element.classList.remove("maximizing");
      await super.minimize();
      this.element.classList.remove("maximized");
    }
  }

  return DragDropApplication;
}
