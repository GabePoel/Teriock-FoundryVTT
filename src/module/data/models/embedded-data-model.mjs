const { DataModel } = foundry.abstract;

/**
 * Model for data that gets embedded within some parent document.
 */
export default class EmbeddedDataModel extends DataModel {
  /** @inheritDoc */
  static defineSchema() {
    return {};
  }

  /**
   * The actor associated with this data model if there is one.
   * @returns {TeriockActor|null}
   */
  get actor() {
    return this.parent.actor;
  }

  /**
   * @returns {EmbeddedDataModel|CommonSystem}
   */
  get parent() {
    return super.parent;
  }

  /**
   * Roll data specific to this data model.
   * @returns {object}
   */
  getLocalRollData() {
    return {};
  }

  /**
   * Recursively fetch roll data.
   * @returns {object}
   */
  getRollData() {
    return this.parent.getRollData();
  }
}
