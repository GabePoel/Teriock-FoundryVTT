import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * Species sheet.
 * @property {TeriockItem<"species">} document
 */
export default class SpeciesSheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = [
    "teriock/sheets/items/species/stats-bar",
    "teriock/sheets/items/species/lifespan-bar",
    "teriock/sheets/items/species/size-bar",
  ];
}
