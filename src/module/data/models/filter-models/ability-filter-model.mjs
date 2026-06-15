import { TernaryField } from "../../fields/_module.mjs";
import { nullString } from "../../fields/helpers/builders.mjs";
import MetaphysicsFilterModel from "./metaphysics-filter-model.mjs";

/**
 * @typedef {MetaphysicsFilters} AbilityFilters
 * @property {boolean|null} basic
 * @property {Teriock.Keys.Interaction|null} interaction
 * @property {Teriock.Keys.Maneuver|null} maneuver
 * @property {boolean|null} spell
 */

/**
 * @property {AbilityFilters} filters
 */
export default class AbilityFilterModel extends MetaphysicsFilterModel {
  /** @inheritDoc */
  static defineFilters() {
    return Object.assign(super.defineFilters(), {
      basic: new TernaryField(),
      interaction: nullString({ choices: TERIOCK.config.ability.interaction }),
      maneuver: nullString({ choices: TERIOCK.config.ability.maneuver }),
      spell: new TernaryField(),
    });
  }

  /** @inheritDoc */
  *filterDocuments(documents) {
    for (const document of super.filterDocuments(documents)) {
      if (
        this._checkTernaryFilter(this.filters.basic, document, "system.basic")
        && this._checkValueFilter(this.filters.interaction, document, "system.interaction")
        && this._checkValueFilter(this.filters.maneuver, document, "system.maneuver")
        && this._checkTernaryFilter(this.spell, document, "system.spell")
      ) {
        yield document;
      }
    }
  }
}
