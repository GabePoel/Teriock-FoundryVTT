import BasePageSheet from "./base-page-sheet.mjs";

export default class HarmSheet extends BasePageSheet {
  /** @inheritDoc */
  async _prepareContext(options) {
    return Object.assign(await super._prepareContext(options), { canHaveAutomations: true });
  }
}
