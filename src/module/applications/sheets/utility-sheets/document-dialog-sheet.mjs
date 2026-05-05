import TeriockDocumentSheet from "./document-sheet.mjs";

export default class DocumentDialogSheet extends TeriockDocumentSheet {
  /** @inheritDoc */
  async _renderFrame(options = {}) {
    const frame = await super._renderFrame(options);
    this.window.header
      .querySelectorAll("button:not([data-action='close'])")
      .forEach((el) => el.remove());
    return frame;
  }
}
