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
   * A value to append to a name.
   * @returns {string}
   */
  get _nameBadge() {
    return "";
  }

  /**
   * Strings to add to the name.
   * @returns {string[]}
   */
  get _nameTags() {
    return [];
  }

  /**
   * A string to show instead of the name.
   * @returns {string}
   */
  get fullName() {
    let name = this.parent?.name ?? "";
    if (this._nameBadge) {
      name = game.i18n.format("TERIOCK.SYSTEMS.Base.EMBED.valueNameString", {
        name,
        value: this._nameBadge.trim(),
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

  /**
   * Whether this document shouldn't have its basic information like compendium source and identifier visible.
   * @return {boolean}
   */
  get isSecret() {
    return false;
  }
}
