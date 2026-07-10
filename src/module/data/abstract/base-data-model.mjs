import { preLocalizeDataModel } from "../../helpers/localization.mjs";
import * as dataMixins from "../mixins/_module.mjs";

const { DataModel } = foundry.abstract;

/**
 * Model for data that gets embedded within some parent document.
 * @mixes AccessData
 * @extends {DataModel}
 */
export default class BaseDataModel extends dataMixins.AccessDataMixin(DataModel) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [];

  /**
   * @inheritDoc
   * @returns {Record<string, DataField>}
   */
  static defineSchema() {
    return {};
  }

  /**
   * Localize this data model.
   */
  static localize() {
    if (!game?.teriock.i18nReady) { return; }
    foundry.helpers.Localization.localizeDataModel(this);
  }

  /**
   * Mark this data model to be localized.
   */
  static preLocalize() {
    preLocalizeDataModel(this);
  }

  /**
   * @inheritDoc
   * @param {object} options - Constructor options
   */
  _initialize(options = {}) {
    super._initialize(options);
    this._safePrepareData();
  }

  /**
   * Safely prepare data
   * @internal
   * @category Document
   */
  _safePrepareData() {
    try {
      this.prepareData();
    } catch (err) {
      console.error(err, this, { parent: this.parent });
    }
  }

  /**
   * Prepare data after initialization or reset.
   * @category Document
   */
  prepareData() {}
}
