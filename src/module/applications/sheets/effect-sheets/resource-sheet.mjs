import { documentOptions } from "../../../constants/options/document-options.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import BaseEffectSheet from "./base-effect-sheet.mjs";

/**
 * {@link TeriockResource} sheet.
 * @extends {BaseEffectSheet}
 * @property {TeriockResource} document
 */
export default class ResourceSheet extends BaseEffectSheet {
  /** @inheritDoc */
  static BARS = ["teriock/sheets/shared/bars/consumable-bar"];

  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["resource"],
    window: {
      icon: makeIconClass(documentOptions.resource.icon, "title"),
    },
  };
}
