import effectConfig from "../../../constants/config/effect-config.mjs";
import { nullString } from "../../fields/helpers/builders.mjs";
import BaseFilterModel from "./base-filter-model.mjs";

/**
 * @typedef {BaseFilters} MetaphysicsFilters
 * @property {Teriock.Keys.EffectType|null} effectType
 * @property {Teriock.Keys.Element|null} element
 * @property {Teriock.Keys.Form|null} form
 * @property {Teriock.Keys.PowerSource|null} powerSource
 */

/**
 * @property {MetaphysicsFilters} filters
 */
export default class MetaphysicsFilterModel extends BaseFilterModel {
  /** @inheritDoc */
  static defineFilters() {
    return Object.assign(super.defineFilters(), {
      effectType: nullString({ choices: TERIOCK.reference.effectTypes }),
      element: nullString({ choices: TERIOCK.reference.elements }),
      form: nullString({ choices: effectConfig.form, initial: "normal" }),
      powerSource: nullString({ choices: TERIOCK.reference.powerSources }),
    });
  }

  /** @inheritDoc */
  *filterDocuments(documents) {
    for (const document of super.filterDocuments(documents)) {
      if (
        this._checkValueFilter(this.filters.effectType, document, "system.effectTypes")
        && this._checkValueFilter(this.filters.element, document, "system.elements")
        && this._checkValueFilter(this.filters.form, document, "system.form")
        && this._checkValueFilter(this.filters.powerSource, document, "system.powerSources")
      ) { yield document; }
    }
  }
}
