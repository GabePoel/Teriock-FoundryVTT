import documentConfig from "../../../constants/config/document-config.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * Sheet for a {@link TeriockSpecies}.
 * @extends {ChildSheet}
 * @property {TeriockSpecies} document
 */
export default class SpeciesSheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = [
    "teriock/sheets/items/species/stats-bar",
    "teriock/sheets/items/species/lifespan-bar",
    "teriock/sheets/items/species/size-bar",
  ];

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    classes: ["species"],
    window: { icon: makeIconClass(documentConfig.species.icon, "title") },
  };
}
