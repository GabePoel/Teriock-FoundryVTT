import { WikiButtonSheetMixin } from "../mixins/button-mixins/_module.mjs";
import BasePageSheet from "./base-page-sheet.mjs";

export default class HarmSheet extends WikiButtonSheetMixin(BasePageSheet) {
  /** @inheritDoc */
  async _prepareContext(options) {
    return Object.assign(await super._prepareContext(options), { canHaveAutomations: true });
  }
}
