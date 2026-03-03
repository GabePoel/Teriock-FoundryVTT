import { documentOptions } from "../../../constants/options/document-options.mjs";
import { makeIconClass, mix } from "../../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";
import BaseEffectSheet from "./base-effect-sheet.mjs";

/**
 * {@link TeriockResource} sheet.
 * @extends {BaseEffectSheet}
 * @mixes UseButtonSheet
 * @property {TeriockResource} document
 */
export default class ResourceSheet extends mix(
  BaseEffectSheet,
  mixins.UseButtonSheetMixin,
) {
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
