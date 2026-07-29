import { BaseAffinity } from "./abstract/_module.mjs";

/**
 * Relevant wiki pages:
 * - [Incapable](https://wiki.teriock.com/index.php/Keyword:Incapable)
 *
 * @extends {BaseAffinity}
 */
export default class IncapabilityAffinity extends BaseAffinity {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AFFINITIES.Binding"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.TERMS.Affinities.incapability.single";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "incapability";
  }
}
