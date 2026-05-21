import TeriockTextEditor from "./text-editor.mjs";

const { DragDrop } = foundry.applications.ux;

export default class TeriockDragDrop extends DragDrop {
  /**
   * Add a document's typed identifier to a drag event.
   * @param {DragEvent} event
   */
  static addIdentifierToDragEvent(event) {
    const data = TeriockTextEditor.getDragEventData(event);
    if (data.uuid && !data.identifier) {
      fromUuid(data.uuid).then(d => {
        data.identifier = d?.typedIdentifier;
        event.dataTransfer.setData("text/plain", JSON.stringify(data));
      });
    }
  }

  /** @inheritDoc */
  _handleDragStart(event) {
    super._handleDragStart(event);
    TeriockDragDrop.addIdentifierToDragEvent(event);
  }
}
