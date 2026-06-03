import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * Sheet for a {@link TeriockArmament}
 * @extends {ChildSheet}
 * @property {TeriockArmament} document
 */
export default class ArmamentSheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = ["teriock/sheets/shared/bars/armament-bars"];
}
