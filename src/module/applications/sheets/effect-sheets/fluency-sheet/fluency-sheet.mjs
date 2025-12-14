import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { makeIconClass, mix } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";
import {
  fieldContextMenu,
  tradecraftContextMenu,
} from "./connections/_context-menus.mjs";

/**
 * {@link TeriockFluency} sheet.
 * @extends {TeriockBaseEffectSheet}
 * @mixes UseButtonSheet
 * @property {TeriockFluency} document
 */
export default class TeriockFluencySheet extends mix(
  TeriockBaseEffectSheet,
  mixins.UseButtonSheetMixin,
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["fluency"],
    window: {
      icon: makeIconClass(documentOptions.fluency.icon, "title"),
    },
  };

  /** @inheritDoc */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/effect-templates/fluency-template/fluency-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    [
      {
        selector: ".field-box",
        menu: fieldContextMenu,
      },
      {
        selector: ".tradecraft-box",
        menu: tradecraftContextMenu,
      },
    ].forEach(({ selector, menu }) => {
      this._connectContextMenu(selector, menu(this.document), "click");
    });
  }
}
