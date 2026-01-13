import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { makeIconClass } from "../../../../helpers/utils.mjs";
import BaseItemSheet from "../base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockPower}.
 * @property {TeriockPower} document
 * @property {TeriockPower} item
 */
export default class PowerSheet extends BaseItemSheet {
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
    all: {
      template:
        "systems/teriock/src/templates/document-templates/item-templates/power-template/power-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
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
