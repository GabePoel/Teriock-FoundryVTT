import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * Sheet for a {@link TeriockPower}.
 * @property {TeriockPower} document
 */
export default class PowerSheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = ["teriock/sheets/items/power/status-bar"];

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.isEditable) { return; }
    this._connectBuildContextMenu(".power-box", TERIOCK.config.power.type, "system.type", "click");
  }
}
