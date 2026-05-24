import { icons } from "../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import BasePageSheet from "./base-page-sheet.mjs";

export default class TradecraftSheet extends BasePageSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(icons.document.fluency, "title") } };
}
