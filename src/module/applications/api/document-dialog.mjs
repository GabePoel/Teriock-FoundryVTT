import { mixClasses } from "../../utils/_module.mjs";
import TeriockDocumentSheet from "./document-sheet.mjs";
import { TemporaryApplicationMixin } from "./mixins/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * A minimal document sheet with some edits to make it better resemble a dialog.
 * @extends {TeriockDocumentSheet}
 * @mixes TemporaryApplication
 */
export default class DocumentDialog extends mixClasses(TeriockDocumentSheet, TemporaryApplicationMixin) {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { teriock: { autoIcon: false, embedEntries: false, rollData: false, wiki: false } };

  /**
   * A prefix to use in sheet titles.
   * @returns {string}
   */
  get _titlePrefix() {
    return "CONTROLS.CommonEdit";
  }

  /** @inheritDoc */
  get title() {
    return _loc("TERIOCK.DIALOGS.Sheet.TITLE", {
      name: this.document.fullName || this.document.name,
      prefix: _loc(this._titlePrefix),
    });
  }

  /** @inheritDoc */
  _getHeaderControls() {
    return super._getHeaderControls().filter(c => !["configureOwnership", "configureSheet"].includes(c.action))
  }

  /** @inheritDoc */
  async _renderFrame(options = {}) {
    const frame = await super._renderFrame(options);
    this.window.header.querySelectorAll("button[data-action='copyUuid']").forEach(el => el.remove());
    return frame;
  }
}
