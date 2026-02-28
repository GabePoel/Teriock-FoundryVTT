import { documentOptions } from "../../../constants/options/document-options.mjs";
import { systemPath } from "../../../helpers/path.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockPower}.
 * @property {TeriockPower} document
 * @property {TeriockPower} item
 */
export default class PowerSheet extends BaseItemSheet {
  /** @inheritDoc */
  static BARS = [systemPath("templates/sheets/items/power/status-bar.hbs")];

  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["power"],
    window: {
      icon: makeIconClass(documentOptions.power.icon, "title"),
    },
  };

  /** @inheritDoc */
  static PARTS = {
    ...this.HEADER_PARTS,
    menu: {
      template: systemPath("templates/sheets/shared/simple-menu.hbs"),
    },
    ...this.CONTENT_PARTS,
  };

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.isEditable) {
      return;
    }
    this._connectBuildContextMenu(
      ".power-box",
      TERIOCK.options.power,
      "system.type",
      "click",
    );
  }
}
