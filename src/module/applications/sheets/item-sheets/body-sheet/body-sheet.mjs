import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { makeIconClass, mix } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseItemSheet from "../base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockBody}.
 * @extends {BaseItemSheet}
 * @mixes UseButtonSheet
 * @mixes WikiButtonSheet
 */
export default class BodySheet extends mix(
  BaseItemSheet,
  mixins.UseButtonSheetMixin,
  mixins.WikiButtonSheetMixin,
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["body"],
    window: {
      icon: makeIconClass(documentOptions.body.icon, "title"),
    },
  };

  /** @inheritDoc */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/item-templates/body-template/body-template.hbs",
      scrollable: [".ab-sheet-everything"],
    },
  };

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.isEditable) {
      return;
    }
    const staticUpdates = {
      ".ab-damage-button": { "system.damage.base.raw": 1 },
      ".ab-av-button": { "system.av.raw": "1" },
      ".ab-bv-button": { "system.bv.raw": "1" },
      ".ab-hit-button": { "system.hit.raw": "1" },
    };
    for (const [selector, update] of Object.entries(staticUpdates)) {
      this.element.querySelectorAll(selector).forEach((el) => {
        el.addEventListener("click", () => this.document.update(update));
      });
    }
  }
}
