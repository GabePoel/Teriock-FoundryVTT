const { TypeDataModel } = foundry.abstract;

/** @inheritDoc */
export default class BaseSystem extends TypeDataModel {
  /** @inheritDoc */
  static defineSchema() {
    return {};
  }

  /**
   * A string to show instead of the name.
   * @returns {string}
   */
  get nameString() {
    return this.parent.name ?? "";
  }
}
