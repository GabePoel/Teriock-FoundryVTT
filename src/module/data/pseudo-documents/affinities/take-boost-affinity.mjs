import { StackingAffinity } from "./abstract/_module.mjs";

/**
 * Relevant wiki pages:
 * - [Boosted](https://wiki.teriock.com/index.php/Keyword:Boosted)
 *
 * @extends {StackingAffinity}
 */
export default class TakeBoostAffinity extends StackingAffinity {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AFFINITIES.TakeBoost"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.TERMS.Affinities.takeBoost.single";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "takeBoost";
  }
}
