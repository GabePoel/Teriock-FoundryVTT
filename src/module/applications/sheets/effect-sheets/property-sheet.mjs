import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * {@link TeriockProperty} sheet.
 * @property {TeriockProperty} document
 */
export default class PropertySheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = ["teriock/sheets/effects/property/status-bar", "teriock/sheets/shared/bars/consumable-bar"];

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { classes: ["property"] };

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.isEditable) { return; }
    this._connectBuildContextMenu(".form-type-box", TERIOCK.config.effect.form, "system.form", "click");
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    return Object.assign(await super._prepareContext(options), { wideToggles: true });
  }
}
