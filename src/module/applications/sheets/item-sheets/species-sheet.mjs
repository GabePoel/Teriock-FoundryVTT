import { documentConfig } from "../../../constants/config/document-config.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockSpecies}.
 * @extends {BaseItemSheet}
 * @mixes WikiButtonSheet
 * @property {TeriockSpecies} document
 * @property {TeriockSpecies} item
 */
export default class SpeciesSheet extends mixClasses(BaseItemSheet, mixins.WikiButtonSheetMixin) {
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
    window: { icon: makeIconClass(documentConfig.species.icon, "title") },
  };
}
