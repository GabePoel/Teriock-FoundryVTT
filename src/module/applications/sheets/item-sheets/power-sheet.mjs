import documentConfig from "../../../constants/config/document-config.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockPower}.
 * @property {TeriockPower} document
 * @property {TeriockPower} item
 */
export default class PowerSheet extends BaseItemSheet {
  /** @inheritDoc */
  static BARS = ["teriock/sheets/items/power/status-bar"];

  /** @inheritDoc */
  static DEFAULT_OPTIONS = { classes: ["power"], window: { icon: makeIconClass(documentConfig.power.icon, "title") } };

  /** @inheritDoc */
  static PARTS = {
    ...this.HEADER_PARTS,
    menu: { template: "teriock/sheets/shared/simple-menu" },
    ...this.CONTENT_PARTS,
  };

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.isEditable) { return; }
    this._connectBuildContextMenu(".power-box", TERIOCK.config.power.type, "system.type", "click");
  }
}
