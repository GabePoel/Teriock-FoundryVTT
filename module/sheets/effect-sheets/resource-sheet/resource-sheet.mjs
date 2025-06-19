const { api } = foundry.applications;
import { callbackContextMenu } from "./connections/_context-menus.mjs";
import { documentOptions } from "../../../helpers/constants/document-options.mjs";
import TeriockBaseEffectSheet from "../base-sheet/base-sheet.mjs";

/**
 * @extends {TeriockBaseEffectSheet}
 */
export default class TeriockResourceSheet extends api.HandlebarsApplicationMixin(TeriockBaseEffectSheet) {
  static DEFAULT_OPTIONS = {
    classes: ["resource"],
    window: {
      icon: "fa-solid fa-" + documentOptions.resource.icon,
    },
  };

  static PARTS = {
    all: {
      template: "systems/teriock/templates/sheets/resource-template/resource-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /** @override */
  _onRender() {
    super._onRender();
    this._connectContextMenu(".function-box", callbackContextMenu(this.document), "click");
  }
}
