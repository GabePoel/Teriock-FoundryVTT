import { documentOptions } from "../../../../helpers/constants/document-options.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockMechanic}.
 *
 * @property {TeriockMechanic} document
 * @property {TeriockMechanic} item
 */
export default class TeriockMechanicSheet extends TeriockBaseItemSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["mechanic"],
    window: {
      icon: "fa-solid fa-" + documentOptions.power.icon,
    },
  };

  /** @inheritDoc */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/item-templates/mechanic-template/mechanic-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    await this._enrichAll(context, {
      description: this.item.system.description,
    });
    context.baseEffects = this.document.effectTypes.base;
    return context;
  }
}
