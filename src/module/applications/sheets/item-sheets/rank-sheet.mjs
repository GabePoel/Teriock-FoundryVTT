import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * Rank sheet.
 * @property {TeriockItem<"rank">} document
 */
export default class RankSheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = [
    "teriock/sheets/items/rank/class-bar",
    "teriock/sheets/shared/bars/stat-bar",
    "teriock/sheets/items/rank/restrictions-bar",
  ];

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { classes: ["rank"] };
}
