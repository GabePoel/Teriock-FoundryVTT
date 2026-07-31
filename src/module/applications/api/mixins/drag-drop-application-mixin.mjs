const { DragDrop } = foundry.applications.ux;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { ApplicationV2 } from "@client/applications/api/_module.mjs";
 */

/**
 * Mixin adding drag-and-drop handling to applications.
 * @template {Constructor<BaseApplication>} T
 * @param {T} Base
 */
export default function DragDropApplicationMixin(Base) {
  return (
    /**
     * @extends {ApplicationV2}
     * @mixes BaseApplication
     * @property {ApplicationConfiguration & Teriock.Application._ApplicationConfiguration} options
     * @mixin
     */
    class DragDropApplication extends Base {
      /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        teriock: {
          dragDrop: {
            bind: { dragEnter: true, dragLeave: true, dragOver: true, dragStart: true, drop: true },
            dropBehavior: { child: false, effect: "none", inherit: false },
            selectors: { drag: ".draggable", drop: null },
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
       * Return a cached copy of a DragDrop instance, creating one on first access.
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
       * What may be dragged out of this application.
       * @returns {string|null}
       */
      get _dragSelector() {
        return this.options.teriock.dragDrop.selectors.drag;
      }

      /**
       * What may be dropped onto within this application. Null makes the whole application a drop target.
       * @returns {string|null}
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
       * Checks if a drop is allowed. Evaluated when the drag handlers are bound rather than during a drag, so it
       * cannot depend on what is currently being dragged. Per-drag checks belong in {@link _dropEffect}.
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
       * What a drop onto this application would do.
       * @param {DragEvent} _event
       * @returns {Teriock.Application.DropEffect}
       */
      _dropEffect(_event) {
        return this.options.teriock.dragDrop.dropBehavior.effect;
      }

      /**
       * A field element under the cursor that handles drops itself, independent of whether the application as a whole
       * is a valid drop target.
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
        this.#dragIsInApplication = false;
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
       * Handles the drag leaving the application, whether from a drag leave event or the drag ending elsewhere.
       * @returns {Promise<void>}
       */
      async _onDragLeaveApplication() {
        this.#dragIsInApplication = false;
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
        event.dataTransfer.dropEffect = this._fieldDropTarget(event) ? "copy" : this._dropEffect(event);
        if (this.options.teriock.dragDrop.style.styleDropTarget) {
          // Field drop targets receive the drop themselves, so the sheet shouldn't be marked while over one.
          const marked = event.dataTransfer.dropEffect !== "none" && !this._fieldDropTarget(event);
          this._dropTargetElement?.classList.toggle(this.options.teriock.dragDrop.style.dropTargetClass, marked);
        }
      }

      /**
       * Handles drag start events.
       * @param {DragEvent} event
       */
      _onDragStart(event) {
        if (event.dataTransfer.effectAllowed === "uninitialized") { event.dataTransfer.effectAllowed = "copy"; }
        DragDrop.implementation.dragStartApplication = this;
        if (this.#shouldMinimizeOnDragStart) { this.#wasMinimizedBeforeDragStart = this.hasFrame && this.minimized; }
        setTimeout(() => {
          if (DragDrop.implementation.dragStartApplication !== this) { return; }
          if (this.#shouldMinimizeOnDragStart && !this.#wasMinimizedBeforeDragStart) { this.minimize(); }
        }, 100);
        const uuid = event.currentTarget?.dataset?.uuid;
        if (uuid) {
          const doc = foundry.utils.fromUuidSync(uuid, { strict: false });
          const dragData = typeof doc?.toDragData === "function"
            ? doc.toDragData()
            : { type: foundry.utils.parseUuid(uuid)?.type, uuid };
          event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
        }
      }

      /**
       * Handles drop events.
       * @param {DragEvent} event
       * @returns {Promise<void>}
       */
      async _onDrop(event) {
        this.#wasMinimizedBeforeDragEnter = false;
        this.#dragIsInApplication = false;
        DragDrop.implementation.leaveApplication(this);
        if (this.options.teriock.dragDrop.dropBehavior.inherit) { return super._onDrop?.(event); }
      }

      /**
       * Explains why a drag that was released over this application couldn't be dropped.
       * @param {DragEvent} _event
       * @returns {boolean} Whether the drag didn't start from this application, and so a rejection may apply.
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
       * Change tabs, deferring to the next render if the navigation to change isn't in the DOM yet.
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
  );
}
