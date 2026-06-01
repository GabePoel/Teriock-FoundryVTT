import { icons } from "../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import { WikiButtonSheetMixin } from "../mixins/button-mixins/_module.mjs";
import BasePageSheet from "./base-page-sheet.mjs";

export default class RuleSheet extends WikiButtonSheetMixin(BasePageSheet) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(icons.document.core, "title") } };
}
