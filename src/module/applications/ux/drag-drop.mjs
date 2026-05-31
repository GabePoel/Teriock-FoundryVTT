import TeriockTextEditor from "./text-editor.mjs";

const { DragDrop } = foundry.applications.ux;

/** @inheritDoc */
export default class TeriockDragDrop extends DragDrop {
  /** @inheritDoc */
  _handleDragStart(event) {
    super._handleDragStart(event);
    const data = TeriockTextEditor.getDragEventData(event);
    if (data.uuid && !data.identifier) {
      fromUuid(data.uuid).then(d => {
        data.identifier = d?.typedIdentifier;
        event.dataTransfer.setData("text/plain", JSON.stringify(data));
      });
    }
  }
}
