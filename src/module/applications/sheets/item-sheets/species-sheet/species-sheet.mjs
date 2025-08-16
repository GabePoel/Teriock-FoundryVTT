import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockSpecies}.
 *
 * @property {TeriockSpecies} document
 * @property {TeriockSpecies} item
 */
export default class TeriockSpeciesSheet extends TeriockBaseItemSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["species"],
  };

  /** @inheritDoc */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/item-templates/species-template/rank-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    await this._enrichAll(context, {
      description: this.item.system.description,
      appearance: this.item.system.appearance,
    });
  }
}
