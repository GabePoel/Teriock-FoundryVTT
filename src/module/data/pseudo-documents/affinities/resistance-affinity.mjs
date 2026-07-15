import { CompetentAffinity } from "./abstract/_module.mjs";

/**
 * Relevant wiki pages:
 * - [Resistance](https://wiki.teriock.com/index.php/Keyword:Resistance)
 *
 * @extends {CompetentAffinity}
 */
export default class ResistanceAffinity extends CompetentAffinity {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AFFINITIES.Resistance"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.TERMS.Affinities.resistance.single";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "resistance";
  }
}
