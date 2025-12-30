/**
 * @param {typeof TeriockDocument} Base
 */
export default function SettingsDocumentMixin(Base) {
  return (
    /**
     * @extends {TeriockDocument}
     * @mixin
     */
    class SettingsDocument extends Base {
      /**
       * @returns {typeof EmbeddedDataModel|null}
       */
      get _settingsFlagsDataModel() {
        return null;
      }

      /** @inheritDoc */
      getFlag(scope, key) {
        if (scope === "teriockDocumentSettings") {
          return foundry.utils.getProperty(this.flags, `${scope}.${key}`);
        } else {
          return super.getFlag(scope, key);
        }
      }

      /**
       * Convenience helper to get a document settings flag.
       * @param {string} key
       * @returns {*}
       */
      getSetting(key) {
        return this.getFlag("teriockDocumentSettings", key);
      }

      /** @inheritDoc */
      prepareData() {
        if (this._settingsFlagsDataModel) {
          this.flags.teriockDocumentSettings = new this._settingsFlagsDataModel(
            this._source.flags.teriockDocumentSettings,
            { parent: this },
          );
        }
        super.prepareData();
      }
    }
  );
}
