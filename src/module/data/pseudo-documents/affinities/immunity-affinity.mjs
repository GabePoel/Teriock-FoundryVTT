import { BaseAffinity } from "./abstract/_module.mjs";

/**
 * Relevant wiki pages:
 * - [Immunity](https://wiki.teriock.com/index.php/Keyword:Immunity)
 *
 * @extends {BaseAffinity}
 */
export default class ImmunityAffinity extends BaseAffinity {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AFFINITIES.Immunity"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.TERMS.Affinities.immunity.single";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "immunity";
  }
}
