import { documentConfig } from "../../../constants/config/document-config.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import BaseEffectSheet from "./base-effect-sheet.mjs";

/**
 * {@link TeriockAttunement} sheet.
 * @property {TeriockAttunement} document
 */
export default class AttunementSheet extends BaseEffectSheet {
  /** @inheritDoc */
  static BARS = ["teriock/sheets/effects/attunement/status-bar"];

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["attunement"],
    window: {
      icon: makeIconClass(documentConfig.attunement.icon, "title"),
    },
  };

  /** @inheritDoc */
  static PARTS = {
    ...this.HEADER_PARTS,
    menu: { template: "teriock/sheets/shared/simple-menu" },
    ...this.CONTENT_PARTS,
  };

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.isEditable) return;
    this._connectBuildContextMenu(
      ".attunement-box",
      TERIOCK.config.attunement.type,
      "system.type",
      "click",
    );
  }
}
