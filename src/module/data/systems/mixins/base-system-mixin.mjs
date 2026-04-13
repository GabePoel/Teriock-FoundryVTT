/**
 * @param {typeof TypeDataModel} Base
 */
export default function BaseSystemMixin(Base) {
  return (
    /**
     * @extends {TypeDataModel}
     * @mixin
     */
    class BaseSystem extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [];

      /** @inheritDoc */
      static defineSchema() {
        return {};
      }

      /**
       * The pseudo-document collections.
       * @returns {Record<string, TypeCollection>}
       */
      get pseudoCollections() {
        return {};
      }

      /** @returns {string} */
      get _nameBadge() {
        return "";
      }

      /** @returns {string[]} */
      get _nameTags() {
        return [];
      }

      /** @returns {string} */
      get fullName() {
        let name = this.parent?.name ?? "";
        if (this._nameBadge) {
          name = _loc("TERIOCK.SYSTEMS.Base.EMBED.valueNameString", {
            name,
            value: this._nameBadge.trim(),
          });
        }
        if (this._nameTags.length > 0) {
          name = _loc("TERIOCK.SYSTEMS.Base.EMBED.taggedNameString", {
            name,
            tags: this._nameTags.join(
              _loc("TERIOCK.SYSTEMS.Base.EMBED.valueSeparator"),
            ),
          });
        }
        return name.trim();
      }

      /** @return {boolean} */
      get isSecret() {
        return false;
      }
    }
  );
}
