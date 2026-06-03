import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * {@link TeriockAttunement} sheet.
 * @property {TeriockAttunement} document
 */
export default class AttunementSheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = ["teriock/sheets/effects/attunement/status-bar"];

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.isEditable) { return; }
    this._connectBuildContextMenu(".attunement-box", TERIOCK.config.attunement.type, "system.type", "click");
  }
}
