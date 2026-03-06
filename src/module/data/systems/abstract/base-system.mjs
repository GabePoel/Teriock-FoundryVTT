const { TypeDataModel } = foundry.abstract;

/** @inheritDoc */
export default class BaseSystem extends TypeDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [];

  /** @inheritDoc */
  static defineSchema() {
    return {};
  }

  /**
   * Strings to add to the name.
   * @returns {string[]}
   */
  get _nameTags() {
    return [];
  }

  /**
   * A value to append to a name.
   * @returns {string}
   */
  get _nameValue() {
    return "";
  }

  /**
   * A string to show instead of the name.
   * @returns {string}
   */
  get nameString() {
    let name = this.parent?.name ?? "";
    if (this._nameValue) {
      name = game.i18n.format("TERIOCK.SYSTEMS.Base.EMBED.valueNameString", {
        name,
        value: this._nameValue.trim(),
      });
    }
    if (this._nameTags.length > 0) {
      name = game.i18n.format("TERIOCK.SYSTEMS.Base.EMBED.taggedNameString", {
        name,
        tags: this._nameTags.join(
          game.i18n.localize("TERIOCK.SYSTEMS.Base.EMBED.valueSeparator"),
        ),
      });
    }
    return name.trim();
  }
}
