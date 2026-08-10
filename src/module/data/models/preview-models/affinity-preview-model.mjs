import affinityConfig from "../../../constants/config/affinity-config.mjs";
import { pathSorterFactory } from "../../../helpers/sort.mjs";
import { objectMap } from "../../../helpers/utils.mjs";
import { TernaryField } from "../../fields/_module.mjs";
import { nullString } from "../../fields/tools/builders.mjs";
import BasePreviewModel from "./base-preview-model.mjs";

/**
 * Previews for {@link VirtualAffinityModel}s. Affinities are consolidated derived data rather than documents, so
 * none of the document-oriented filters apply and this defines its own set.
 * @inheritDoc
 * @property {Teriock.Models.AffinityFilters} filters
 */
export default class AffinityPreviewModel extends BasePreviewModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AFFINITIES.Preview"];

  /** @inheritDoc */
  static get sorters() {
    return {
      category: {
        label: "TERIOCK.AFFINITIES.Preview.FIELDS.filters.category.label",
        sorter: pathSorterFactory("categoryLabel"),
      },
      default: { label: "COMMON.Default", sorter: pathSorterFactory("sort") },
      name: { label: "DOCUMENT.FIELDS.name.label", sorter: pathSorterFactory("name") },
      type: { label: "TERIOCK.AFFINITIES.Preview.FIELDS.filters.type.label", sorter: pathSorterFactory("typeLabel") },
    };
  }

  /** @inheritDoc */
  static defineFilters() {
    return {
      category: nullString({
        choices: objectMap(affinityConfig.categories, c => c.label, { localize: true }),
        label: "TERIOCK.AFFINITIES.Preview.FIELDS.filters.category.label",
      }),
      protection: new TernaryField({ label: "TERIOCK.AFFINITIES.Preview.FIELDS.filters.protection.label" }),
      type: nullString({
        choices: objectMap(affinityConfig.types, t => t.label, { localize: true, sort: false }),
        label: "TERIOCK.AFFINITIES.Preview.FIELDS.filters.type.label",
      }),
      weakness: new TernaryField({ label: "TERIOCK.AFFINITIES.Preview.FIELDS.filters.weakness.label" }),
    };
  }

  /** @inheritDoc */
  get _formPathsSelect() {
    return ["filters.type", "filters.category"];
  }

  /** @inheritDoc */
  get _formPathsTernary() {
    return ["filters.protection", "filters.weakness"];
  }

  /**
   * @inheritDoc
   * @param {VirtualAffinityModel[]} affinities
   * @returns {Generator<VirtualAffinityModel, void, void>}
   */
  *filterDocuments(affinities) {
    for (const affinity of affinities) {
      if (
        this._checkValueFilter(this.filters.category, affinity.category)
        && this._checkValueFilter(this.filters.type, affinity.type)
        && this._checkTernaryFilter(this.filters.protection, affinity.protection)
        && this._checkTernaryFilter(this.filters.weakness, affinity.weakness)
      ) {
        yield affinity;
      }
    }
  }
}
