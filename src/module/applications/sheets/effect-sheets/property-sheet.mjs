import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * {@link TeriockProperty} sheet.
 * @property {TeriockProperty} document
 */
export default class PropertySheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = ["teriock/sheets/effects/property/status-bar", "teriock/sheets/shared/bars/consumable-bar"];

  /** @inheritDoc */
  async _prepareContext(options) {
    return Object.assign(await super._prepareContext(options), { wideToggles: true });
  }
}
