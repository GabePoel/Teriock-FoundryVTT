const { TypeDataModel } = foundry.abstract;

export default class BaseCardSystem extends TypeDataModel {
  /** @inheritDoc */
  static defineSchema() {
    return {};
  }

  /**
   * @inheritDoc
   * @returns {TeriockCard}
   */
  get parent() {
    return super.parent;
  }
}
