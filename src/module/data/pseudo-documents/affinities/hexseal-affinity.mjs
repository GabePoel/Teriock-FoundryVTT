import { BaseAffinity } from "./abstract/_module.mjs";

/**
 * Relevant wiki pages:
 * - [Hexseal](https://wiki.teriock.com/index.php/Keyword:Hexseal)
 *
 * @extends {BaseAffinity}
 */
export default class HexsealAffinity extends BaseAffinity {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AFFINITIES.Hexseal"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.TERMS.Affinities.hexseal.single";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "hexseal";
  }
}
