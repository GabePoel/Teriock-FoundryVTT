/**
 * @import { DataModel, Document, TypeDataModel } from "@common/abstract/_module.mjs";
 */

import { fieldSorterFactory } from "../../helpers/sort.mjs";

/**
 * Mixin for both documents and data models.
 * @template {Constructor<DataModel | Document | TypeDataModel>} T
 * @param {T} Base
 */
export default function AbstractDataMixin(Base) {
  /**
   * @extends {DataModel | Document | TypeDataModel}
   * @mixin
   */
  class AbstractData extends Base {
    /**
     * A field sorter for this data model.
     * @type {Teriock.Sort.FieldSorter}
     */
    fieldSorter = fieldSorterFactory(this);
  }

  return AbstractData;
}
