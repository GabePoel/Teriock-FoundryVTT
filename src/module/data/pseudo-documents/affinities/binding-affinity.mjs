import { BaseAffinity } from "./abstract/_module.mjs";

/**
 * Relevant wiki pages:
 * - [Bound](https://wiki.teriock.com/index.php/Condition:Bound)
 *
 * @extends {BaseAffinity}
 */
export default class BindingAffinity extends BaseAffinity {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AFFINITIES.Binding"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.TERMS.Affinities.binding.single";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "binding";
  }
}
