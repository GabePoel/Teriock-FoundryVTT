const { api } = foundry.applications;
import { documentOptions } from "../../../helpers/constants/document-options.mjs";
import { fieldContextMenu, tradecraftContextMenu } from "./connections/_context-menus.mjs";
import TeriockBaseEffectSheet from "../base-sheet/base-sheet.mjs";

/**
 * @extends {TeriockBaseEffectSheet}
 */
export default class TeriockFluencySheet extends api.HandlebarsApplicationMixin(TeriockBaseEffectSheet) {
  static DEFAULT_OPTIONS = {
    classes: ["fluency"],
    window: {
      icon: "fa-solid fa-" + documentOptions.fluency.icon,
    },
  };
  static PARTS = {
    all: {
      template: "systems/teriock/templates/sheets/fluency-template/fluency-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    [
      { selector: ".field-box", menu: fieldContextMenu },
      { selector: ".tradecraft-box", menu: tradecraftContextMenu },
    ].forEach(({ selector, menu }) => {
      this._connectContextMenu(selector, menu(this.document), "click");
    });
  }
}
