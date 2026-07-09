import TeriockDocumentSheet from "./document-sheet.mjs";
import { TemporaryApplicationMixin } from "./mixins/_module.mjs";

/**
 * A minimal document sheet with some edits to make it better resemble a dialog.
 */
export default class DocumentDialog extends TemporaryApplicationMixin(TeriockDocumentSheet) {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { teriock: { autoIcon: false } };

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
      name: this.document.fullName || this.document.name,
      prefix: _loc(this._titlePrefix),
    });
  }

  /** @inheritDoc */
  async _renderFrame(options = {}) {
    const frame = await super._renderFrame(options);
    this.window.header.querySelectorAll("button:not([data-action='close'])").forEach(el => el.remove());
    return frame;
  }
}
