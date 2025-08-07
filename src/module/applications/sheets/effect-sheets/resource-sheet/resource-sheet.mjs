import { documentOptions } from "../../../../helpers/constants/document-options.mjs";
import { callbackContextMenu } from "./connections/_context-menus.mjs";
import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";

/**
 * Resource sheet for Teriock system resources.
 * Provides resource management with context menus for callback functions.
 *
 * @property {TeriockResource} document
 */
export default class TeriockResourceSheet extends TeriockBaseEffectSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["resource"],
    window: {
      icon: "fa-solid fa-" + documentOptions.resource.icon,
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

  /** @inheritDoc */
  async _onRender(options, context) {
    await super._onRender(options, context);
    this._connectContextMenu(
      ".function-box",
      callbackContextMenu(this.document),
      "click",
    );
  }
}
