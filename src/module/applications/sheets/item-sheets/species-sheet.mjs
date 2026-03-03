import { documentOptions } from "../../../constants/options/document-options.mjs";
import { makeIconClass, mix } from "../../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockSpecies}.
 * @extends {BaseItemSheet}
 * @mixes WikiButtonSheet
 * @property {TeriockSpecies} document
 * @property {TeriockSpecies} item
 */
export default class SpeciesSheet extends mix(
  BaseItemSheet,
  mixins.WikiButtonSheetMixin,
) {
  /** @inheritDoc */
  static BARS = [
    "teriock/sheets/items/species/stats-bar",
    "teriock/sheets/items/species/lifespan-bar",
    "teriock/sheets/items/species/size-bar",
  ];

  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["species"],
    window: {
      icon: makeIconClass(documentOptions.species.icon, "title"),
    },
  };

  /** @inheritDoc */
  static PARTS = {
    ...this.HEADER_PARTS,
    menu: { template: "teriock/sheets/items/species/menu" },
    ...this.CONTENT_PARTS,
  };

  /** @inheritDoc */
  get _buttonUpdates() {
    return {
      ...super._buttonUpdates,
      ".ab-size-button": {
        "system.size.min": this.item.system.size.value,
        "system.size.max": this.item.system.size.value,
      },
      ".ab-lifespan-button": {
        "system.adult": 20,
        "system.lifespan": 100,
      },
    };
  }
}
