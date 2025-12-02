import {
  UseButtonSheetMixin,
  WikiButtonSheetMixin,
} from "../../mixins/_module.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockBody}.
 * @extends {TeriockBaseItemSheet}
 * @mixes UseButtonSheet
 * @mixes WikiButtonSheet
 */
export default class TeriockBodySheet extends WikiButtonSheetMixin(
  UseButtonSheetMixin(TeriockBaseItemSheet),
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["body"],
    window: {
      icon: `fa-solid fa-boot`,
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
    if (!this.editable) {
      return;
    }

    const staticUpdates = {
      ".ab-damage-button": { "system.damage.base.saved": 1 },
      ".ab-av-button": { "system.av.saved": 1 },
      ".ab-bv-button": { "system.bv.saved": 1 },
      ".ab-hit-button": { "system.hit.saved": 1 },
    };

    for (const [selector, update] of Object.entries(staticUpdates)) {
      this.element.querySelectorAll(selector).forEach((el) => {
        el.addEventListener("click", () => this.document.update(update));
      });
    }
  }
}
