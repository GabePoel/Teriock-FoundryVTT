import { CompetentAffinity } from "./abstract/_module.mjs";

/**
 * Relevant wiki pages:
 * - [Hexproof](https://wiki.teriock.com/index.php/Keyword:Hexproof)
 *
 * @extends {CompetentAffinity}
 */
export default class HexproofAffinity extends CompetentAffinity {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AFFINITIES.Hexproof"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.TERMS.Affinities.hexproof.single";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "hexproof";
  }
}
