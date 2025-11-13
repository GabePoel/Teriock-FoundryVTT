const { DataModel } = foundry.abstract;

export default class BaseDataModel extends DataModel {
  /**
   * @returns {BaseDataModel|CommonTypeModel}
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
