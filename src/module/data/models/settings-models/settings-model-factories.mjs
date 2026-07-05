import settingsConfig from "../../../constants/config/settings-config.mjs";
import { BaseDataModel } from "../../abstract/_module.mjs";
import { TernaryField } from "../../fields/_module.mjs";

/**
 * @param {Teriock.Config.SettingsCategory} category
 * @param {Teriock.Config.SettingsKey<Teriock.Config.SettingsCategory>} key
 * @param {"hint"|"name"} field
 * @returns {string}
 */
function settingsPath(category, key, field) {
  return `TERIOCK.SETTINGS.${category}.${key}.${field}`;
}

/**
 * Build a schema with one field per setting in a category.
 * @param {Teriock.Config.SettingsCategory} category
 * @param {typeof foundry.data.fields.DataField} FieldClass
 * @returns {DataSchema}
 */
function settingsSchema(category, FieldClass) {
  return Object.fromEntries(
    Object.keys(settingsConfig[category]).map(
      key => [
        key,
        new FieldClass({
          hint: settingsPath(category, key, "hint"),
          initial: settingsConfig[category][key],
          label: settingsPath(category, key, "name"),
        }),
      ]
    ),
  );
}

export class CommonDocumentSettingsModel extends BaseDataModel {
  /** @type {Teriock.Config.SettingsCategory} */
  static CATEGORY;

  /**
   * Resolve a document setting against its user default.
   * @param {Teriock.Config.SettingsKey<Teriock.Config.SettingsCategory>} setting
   * @returns {boolean}
   */
  getSetting(setting) {
    if (!this.constructor.CATEGORY) { return false; }
    if (typeof this[setting] === "boolean") { return this[setting]; }
    return game.settings.get("teriock", this.constructor.CATEGORY)[setting];
  }
}

/**
 * @template {Teriock.Config.SettingsCategory} C
 * @param {C} category
 * @returns {Teriock.Models.DocumentSettingsModelConstructor<C>}
 */
export function documentSettingsModelFactory(category) {
  return class DocumentSettingsModel extends CommonDocumentSettingsModel {
    /** @type {Teriock.Config.SettingsCategory} */
    static CATEGORY = category;

    /** @inheritDoc */
    static defineSchema() {
      return settingsSchema(category, TernaryField);
    }
  };
}

/**
 * @template {Teriock.Config.SettingsCategory} Category
 * @param {Category} category
 * @returns {Teriock.Models.UserSettingsModelConstructor<Category>}
 */
export function userSettingsModelFactory(category) {
  return class UserSettingsModel extends BaseDataModel {
    /** @inheritDoc */
    static defineSchema() {
      return settingsSchema(category, foundry.data.fields.BooleanField);
    }
  };
}
