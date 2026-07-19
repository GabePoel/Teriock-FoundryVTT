const { DragDrop } = foundry.applications.ux;

/**
 * Mixin adding drag-and-drop handling to applications.
 * @param {typeof ApplicationV2} Base
 */
export default function DragDropApplicationMixin(Base) {
  return (
    /**
     * @extends {ApplicationV2}
     * @mixin
     */
    class DragDropApplication extends Base {
      /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = { teriock: { maximizeOnDragEnter: false } };

      /** @type {DragDrop} */
      #dragDrop = null;

      /** @type {boolean} */
      #dragIsInApplication = false;

      /** @type {boolean|null} */
      #wasMinimizedBeforeDragEnter = null;

      /** @type {boolean|null} */
      #wasMinimizedBeforeDragStart = null;

      /**
       * Return a cached copy of a DragDrop instance, creating one on first access.
       * @returns {DragDrop}
       */
      get _dragDrop() {
        return this.#dragDrop ??= new DragDrop.implementation({
          callbacks: {
            dragenter: this._onDragEnter.bind(this),
            dragleave: this._onDragLeave.bind(this),
            dragover: this._onDragOver.bind(this),
            dragstart: this._onDragStart.bind(this),
            drop: this._onDrop.bind(this),
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
        return ".draggable";
      }

      /**
       * What may be dropped onto within this application. Null makes the whole application a drop target.
       * @returns {string|null}
       */
      get _dropSelector() {
        return null;
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
        return "none";
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
        if (this.options?.teriock?.minimizeOnDragStart && !this.#wasMinimizedBeforeDragStart) { await this.maximize(); }
      }

      /**
       * Handles drag enter events.
       * @param {DragEvent} event
       * @returns {Promise<void>}
       */
      async _onDragEnter(event) {
        if (this.#dragIsInApplication) { return; }
        this.#dragIsInApplication = true;
        DragDrop.implementation.enteredApplications.add(this);
        await this._onDragEnterApplication(event);
      }

      /**
       * Handles drag enter events when they first enter the application.
       * @param {DragEvent} event
       * @returns {Promise<void>}
       */
      async _onDragEnterApplication(event) {
        if (this._dropEffect(event) === "none" && !this._fieldDropTarget(event)) { return; }
        if (this.hasFrame) { this.bringToFront(); }
        if (!this.options?.teriock?.maximizeOnDragEnter) { return; }
        this.#wasMinimizedBeforeDragEnter = this.hasFrame && this.minimized;
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
        await this._onDragLeaveApplication();
      }

      /**
       * Handles the drag leaving the application, whether from a drag leave event or the drag ending elsewhere.
       * @returns {Promise<void>}
       */
      async _onDragLeaveApplication() {
        this.#dragIsInApplication = false;
        DragDrop.implementation.enteredApplications.delete(this);
        if (this.#wasMinimizedBeforeDragEnter) { await this.minimize(); }
        this.#wasMinimizedBeforeDragEnter = null;
      }

      /**
       * Handles drag over events.
       * @param {DragEvent} event
       * @returns {Promise<void>}
       */
      async _onDragOver(event) {
        event.dataTransfer.dropEffect = this._fieldDropTarget(event) ? "copy" : this._dropEffect(event);
      }

      /**
       * Handles drag start events.
       * @param {DragEvent} event
       */
      _onDragStart(event) {
        // Starts out as "uninitialized" rather than nothing, so it can't be tested for with `??=`.
        if (event.dataTransfer.effectAllowed === "uninitialized") { event.dataTransfer.effectAllowed = "copy"; }
        DragDrop.implementation.dragStartApplication = this;
        if (this.options?.teriock?.minimizeOnDragStart) {
          this.#wasMinimizedBeforeDragStart = this.hasFrame && this.minimized;
        }
        setTimeout(() => {
          if (DragDrop.implementation.dragStartApplication !== this) { return; }
          if (this.options?.teriock?.minimizeOnDragStart && this.hasFrame && !this.#wasMinimizedBeforeDragStart) {
            this.minimize();
          }
        }, 100);
        const uuid = event.currentTarget.dataset.uuid;
        if (uuid) {
          // The drag data store is only writable during this event, so the drag data must be built synchronously.
          const doc = fromUuidSync(uuid, { strict: false });
          const dragData = typeof doc?.toDragData === "function"
            ? doc.toDragData()
            : { type: foundry.utils.parseUuid(uuid)?.type, uuid };
          event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
        }
      }

      /**
       * Handles drop events.
       * @param {DragEvent} _event
       * @returns {Promise<void>}
       */
      async _onDrop(_event) {
        this.#dragIsInApplication = false;
        DragDrop.implementation.enteredApplications.delete(this);
        this.#wasMinimizedBeforeDragEnter = null;
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        this._dragDrop.bind(this.element);
      }
    }
  );
}
