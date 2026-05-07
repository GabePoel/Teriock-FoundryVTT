import TeriockDocumentSheet from "./document-sheet.mjs";

/**
 * A minimal document sheet with some edits to make it better resemble a dialog.
 */
export default class DocumentDialogSheet extends TeriockDocumentSheet {
  /**
   * A prefix to use in sheet titles.
   * @returns {string}
   */
  get _titlePrefix() {
    return "TERIOCK.DIALOGS.Sheet.PREFIX";
  }

  /** @inheritDoc */
  get title() {
    return _loc("TERIOCK.DIALOGS.Sheet.TITLE", {
      prefix: _loc(this._titlePrefix),
      name: this.document.fullName || this.document.name,
    });
  }

  /** @inheritDoc */
  async _renderFrame(options = {}) {
    const frame = await super._renderFrame(options);
    this.window.header
      .querySelectorAll("button:not([data-action='close'])")
      .forEach((el) => el.remove());
    return frame;
  }
}
