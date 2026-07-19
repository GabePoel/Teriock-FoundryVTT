const { DragDrop, TextEditor } = foundry.applications.ux;

/** @inheritDoc */
export default class TeriockDragDrop extends DragDrop {
  /** @type {Teriock.Application.DragDropPayload<AnyCommonDocument>|null} */
  static #payload = null;

  /**
   * Cleanup for any drag initialized via {@link initializeDragEvent}.
   * @param {DragEvent} event
   * @todo Move to {@link this._handleDragEnd} when core fixes event binding in {@link CompendiumDirectory._onRender}.
   */
  static #onDragEnd(event) {
    TeriockDragDrop.dragStartApplication?._onDragEnd(event);
    // No drop happened anywhere, so let the application under the release point explain a rejection.
    if (event.dataTransfer.dropEffect === "none") {
      const element = document.elementFromPoint(event.clientX, event.clientY);
      const application = foundry.applications.instances.get(element?.closest?.(".application")?.id);
      application?._onDropRejected?.(event);
    }
    for (const application of TeriockDragDrop.enteredApplications) { application._onDragLeaveApplication(); }
    TeriockDragDrop.enteredApplications.clear();
    TeriockDragDrop.#payload = null;
    TeriockDragDrop.dragStartApplication = null;
  }

  /**
   * Set document drag data.
   * @param {DragEvent} event
   * @param {Teriock.Application.DropData} dragData
   * @param {TeriockDocument} document
   */
  static #setDocumentDragData(event, dragData, document) {
    dragData.identifier ??= document?.typedIdentifier;
    TeriockDragDrop.#payload.document ??= document;
    TeriockDragDrop.#payload.identifier = dragData.identifier;
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  /** @type {DragDropApplication|null} */
  static dragStartApplication = null;

  /**
   * Applications the current drag is inside, so they can be cleaned up when a drag ends without a drop or leave event
   * ever reaching them.
   * @type {Set<DragDropApplication>}
   */
  static enteredApplications = new Set();

  /**
   * The payload of the drag currently in progress.
   * @returns {Teriock.Application.DragDropPayload<AnyCommonDocument>|null}
   */
  static get payload() {
    return TeriockDragDrop.#payload;
  }

  /**
   * Ensure all the required drag event data is set. The drag data store is only writable while the dragstart event is
   * being dispatched, so this must be called synchronously from a dragstart handler.
   * @param {DragEvent} event
   */
  static initializeDragEvent(event) {
    game.tooltip.deactivate();
    window.addEventListener("dragend", TeriockDragDrop.#onDragEnd, { once: true });
    const dragData = TextEditor.implementation.getDragEventData(event);
    dragData.interactive ??= !game.keyboard.isModifierActive("CONTROL");
    TeriockDragDrop.#payload = dragData;
    const document = fromUuidSync(dragData.uuid, { strict: false });
    if (document) {
      this.#setDocumentDragData(event, dragData, document);
    } else {
      fromUuid(dragData.uuid).then(document => {
        if (!document) { return; }
        this.#setDocumentDragData(event, dragData, document);
      });
    }
  }

  /** @inheritDoc */
  _handleDragStart(event) {
    super._handleDragStart(event);
    TeriockDragDrop.initializeDragEvent(event);
  }
}
