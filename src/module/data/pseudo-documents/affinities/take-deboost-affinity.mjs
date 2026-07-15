import { StackingAffinity } from "./abstract/_module.mjs";

/**
 * Relevant wiki pages:
 * - [Deboosted](https://wiki.teriock.com/index.php/Keyword:Deboosted)
 *
 * @extends {StackingAffinity}
 */
export default class TakeDeboostAffinity extends StackingAffinity {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AFFINITIES.TakeDeboost"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.TERMS.Affinities.takeDeboost.single";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "takeDeboost";
  }
}
