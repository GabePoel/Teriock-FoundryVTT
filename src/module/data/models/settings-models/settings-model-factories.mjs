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
 * @param {DataFieldOptions} [options]
 * @returns {DataSchema}
 */
function settingsSchema(category, FieldClass, options = {}) {
  return Object.fromEntries(
    Object.keys(settingsConfig.categories[category]).map(
      key => [
        key,
        new FieldClass({
          hint: settingsPath(category, key, "hint"),
          initial: settingsConfig.categories[category][key],
          label: settingsPath(category, key, "name"),
          ...options,
        }),
      ]
    ),
  );
}

export class CommonDocumentSettingsModel extends BaseDataModel {
  /** @type {Teriock.Config.DocumentSettingsCategory} */
  static CATEGORY;

  /**
   * Maps each setting key to the group whose user setting backs it.
   * @type {Record<string, Teriock.Config.SettingsCategory>}
   */
  static KEY_GROUPS = {};

  /**
   * Resolve a document setting against its user default.
   * @param {Teriock.Config.ComposedSettingsKey} setting
   * @returns {boolean}
   */
  getSetting(setting) {
    if (typeof this[setting] === "boolean") { return this[setting]; }
    const group = this.constructor.KEY_GROUPS[setting];
    return group ? game.settings.get("teriock", group)[setting] : false;
  }
}

/**
 * @template {Teriock.Config.DocumentSettingsCategory} C
 * @param {C} category
 * @returns {Teriock.Models.DocumentSettingsModelConstructor<C>}
 */
export function documentSettingsModelFactory(category) {
  const groups = settingsConfig.compositions[category];
  return class DocumentSettingsModel extends CommonDocumentSettingsModel {
    /** @type {Teriock.Config.DocumentSettingsCategory} */
    static CATEGORY = category;

    /** @inheritDoc */
    static KEY_GROUPS = Object.fromEntries(
      groups.flatMap(g => Object.keys(settingsConfig.categories[g]).map(k => [k, g])),
    );

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign({}, ...groups.map(g => settingsSchema(g, TernaryField, { initial: null })));
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
