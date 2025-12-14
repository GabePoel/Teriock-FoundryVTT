import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { makeIconClass, mix } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";

/**
 * {@link TeriockResource} sheet.
 * @extends {TeriockBaseEffectSheet}
 * @mixes UseButtonSheet
 * @property {TeriockResource} document
 */
export default class TeriockResourceSheet extends mix(
  TeriockBaseEffectSheet,
  mixins.UseButtonSheetMixin,
) {
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

  /** @inheritDoc */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/effect-templates/resource-template/resource-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };
}
