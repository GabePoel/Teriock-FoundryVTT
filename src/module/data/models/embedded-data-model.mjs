import { AccessDataMixin } from "../shared/mixins/_module.mjs";

const { DataModel } = foundry.abstract;

/**
 * Model for data that gets embedded within some parent document.
 * @extends {DataModel}
 */
export default class EmbeddedDataModel extends AccessDataMixin(DataModel) {
  /**
   * @inheritDoc
   * @returns {Record<string, DataField>}
   */
  static defineSchema() {
    return {};
  }
}
