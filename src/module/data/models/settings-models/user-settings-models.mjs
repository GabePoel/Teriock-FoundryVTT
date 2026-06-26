import settingsConfig from "../../../constants/config/settings-config.mjs";
import { TernaryField } from "../../fields/_module.mjs";
import EmbeddedDataModel from "../embedded-data-model.mjs";

const { fields } = foundry.data;

/**
 * @param {Teriock.Config.SettingsCategory} category
 * @param {Teriock.Config.SettingsKey<Teriock.Config.SettingsCategory>} key
 * @param {"hint"|"name"} field
 * @returns {string}
 */
export function settingsPath(category, key, field) {
  return `TERIOCK.SETTINGS.${category}.${key}.${field}`;
}

/**
 * @param {Teriock.Config.SettingsCategory} category
 * @param {Teriock.Config.SettingsKey<Teriock.Config.SettingsCategory>} key
 * @returns {BooleanField}
 */
export function booleanSettingField(category, key) {
  return new fields.BooleanField({
    hint: settingsPath(category, key, "hint"),
    initial: settingsConfig[category][key],
    label: settingsPath(category, key, "name"),
  });
}

/**
 * @param {Teriock.Config.SettingsCategory} category
 * @param {Teriock.Config.SettingsKey<Teriock.Config.SettingsCategory>} key
 * @returns {TernaryField}
 */
export function ternarySettingField(category, key) {
  return new TernaryField({
    hint: settingsPath(category, key, "hint"),
    initial: null,
    label: settingsPath(category, key, "name"),
  });
}

/**
 * @template {Teriock.Config.SettingsCategory} Category
 * @param {Category} category
 * @returns {Teriock.Models.UserSettingsModelConstructor<Category>}
 */
export function defineUserSettingsModel(category) {
  /** @extends {EmbeddedDataModel} */
  class UserSettingsModel extends EmbeddedDataModel {
    /** @type {Teriock.Config.SettingsCategory} */
    static CATEGORY = category;

    /** @inheritDoc */
    static defineSchema() {
      return Object.fromEntries(
        Object.keys(settingsConfig[category]).map(
          key => [
            key,
            booleanSettingField(
              category,
              /** @type {Teriock.Config.SettingsKey<Teriock.Config.SettingsCategory>} */ (key),
            ),
          ]
        ),
      );
    }
  }

  return UserSettingsModel;
}

/** @type {Teriock.Models.UserSettingsModelConstructorMap} */
export const userSettingsModels = {
  ability: defineUserSettingsModel("ability"),
  actor: defineUserSettingsModel("actor"),
  armament: defineUserSettingsModel("armament"),
};

/**
 * Empty document settings for child documents without a dedicated category.
 * @extends {Teriock.Models.CommonSettingsModelData}
 */
export default class CommonSettingsModel extends EmbeddedDataModel {}
