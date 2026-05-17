/**
 * @param {typeof BaseDocument} Base
 * @todo Since we no longer have settings on token documents, the settings can be moved into the normal system
 * schema. We should do that. This can happen in conjunction with a general config file and a way of accessing
 * document behavior settings that more cleanly integrates with game settings.
 */
export default function SettingsDocumentMixin(Base) {
  return (
    /**
     * @mixes BaseDocument
     * @mixin
     */
    class SettingsDocument extends Base {
      /**
       * @returns {typeof EmbeddedDataModel|null}
       */
      get SettingsFlagsDataModel() {
        return null;
      }

      /** @inheritDoc */
      getFlag(scope, key) {
        if (scope === "teriockDocumentSettings") {
          return foundry.utils.getProperty(this.flags, `${scope}.${key}`);
        }
        return super.getFlag(scope, key);
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
        if (this.SettingsFlagsDataModel) {
          const model = this.SettingsFlagsDataModel;
          foundry.helpers.Localization.localizeDataModel(model);
          this.flags.teriockDocumentSettings = new model(this._source.flags.teriockDocumentSettings, { parent: this });
        }
        super.prepareData();
      }
    }
  );
}
