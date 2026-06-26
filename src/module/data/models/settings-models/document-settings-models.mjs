import EmbeddedDataModel from "../embedded-data-model.mjs";
import { ternarySettingField } from "./user-settings-models.mjs";

/**
 * @template {Teriock.Config.SettingsCategory} C
 * @param {C} category
 * @returns {Teriock.Models.DocumentSettingsModelConstructor<C>}
 */
export function defineDocumentSettingsModel(category) {
  /** @extends {EmbeddedDataModel} */
  class DocumentSettingsModel extends EmbeddedDataModel {
    /** @type {C} */
    static CATEGORY = category;

    /** @inheritDoc */
    static defineSchema() {
      return Object.fromEntries(
        Object.keys(TERIOCK.config.settings[category]).map(
          key => [key, ternarySettingField(category, /** @type {Teriock.Config.SettingsKey<C>} */ (key))]
        ),
      );
    }

    /**
     * Resolve a document setting against its user default.
     * @param {Teriock.Config.SettingsKey<C>} setting
     * @returns {boolean}
     */
    getSetting(setting) {
      if (typeof this[setting] === "boolean") { return this[setting]; }
      return game.settings.get("teriock", category)[setting];
    }
  }

  return DocumentSettingsModel;
}

/** @type {Teriock.Models.DocumentSettingsModelConstructorMap} */
export const documentSettingsModels = {
  ability: defineDocumentSettingsModel("ability"),
  actor: defineDocumentSettingsModel("actor"),
  armament: defineDocumentSettingsModel("armament"),
};
