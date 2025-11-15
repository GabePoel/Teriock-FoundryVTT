const { DataModel } = foundry.abstract;

/**
 * Model for data that gets embedded within some parent document.
 */
export default class EmbeddedDataModel extends DataModel {
  /**
   * @returns {EmbeddedDataModel|CommonTypeModel}
   */
  get parent() {
    return super.parent;
  }

  /**
   * Recursively fetch roll data.
   * @returns {object}
   */
  getRollData() {
    return this.parent.getRollData();
  }
}
