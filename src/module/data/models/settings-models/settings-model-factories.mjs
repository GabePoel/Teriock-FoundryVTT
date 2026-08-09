import documentBehaviorConfig from "../../../constants/config/document-behavior-config.mjs";
import { BaseDataModel } from "../../abstract/_module.mjs";
import { TernaryField } from "../../fields/_module.mjs";

/**
 * @import { DataSchema } from "@common/abstract/_types.mjs";
 * @import { DataFieldOptions } from "@common/data/_types.mjs";
 */

/**
 * @param {Teriock.Behavior.SettingsCategory} category
 * @param {Teriock.Behavior.SettingsKey<Teriock.Behavior.SettingsCategory>} key
 * @param {"hint"|"name"} field
 * @returns {string}
 */
function settingsPath(category, key, field) {
  return `TERIOCK.SETTINGS.${category}.${key}.${field}`;
}

/**
 * Build a schema with one field per setting in a category.
 * @param {Teriock.Behavior.SettingsCategory} category
 * @param {typeof foundry.data.fields.DataField} FieldClass
 * @param {DataFieldOptions} [options]
 * @returns {DataSchema}
 */
function settingsSchema(category, FieldClass, options = {}) {
  return Object.fromEntries(
    Object.keys(documentBehaviorConfig.categories[category].settings).map(
      key => [
        key,
        new FieldClass({
          hint: settingsPath(category, key, "hint"),
          initial: documentBehaviorConfig.categories[category].settings[key],
          label: settingsPath(category, key, "name"),
          ...options,
        }),
      ]
    ),
  );
}

export class CommonDocumentSettingsModel extends BaseDataModel {
  /** @type {Teriock.Behavior.DocumentSettingsCategory} */
  static CATEGORY;

  /**
   * Maps each setting key to the group whose user setting backs it.
   * @type {Record<string, Teriock.Behavior.SettingsCategory>}
   */
  static KEY_GROUPS = {};

  /**
   * Resolve a document setting against its user default.
   * @param {Teriock.Behavior.ComposedSettingsKey} setting
   * @returns {boolean}
   */
  getSetting(setting) {
    if (typeof this[setting] === "boolean") { return this[setting]; }
    const group = this.constructor.KEY_GROUPS[setting];
    return group ? game.settings.get("teriock", group)[setting] : false;
  }
}

/**
 * @template {Teriock.Behavior.DocumentSettingsCategory} C
 * @param {C} category
 * @returns {Teriock.Models.DocumentSettingsModelConstructor<C>}
 */
export function DocumentSettingsModelFactory(category) {
  const groups = documentBehaviorConfig.compositions[category];
  class DocumentSettingsModel extends CommonDocumentSettingsModel {
    /** @type {Teriock.Behavior.DocumentSettingsCategory} */
    static CATEGORY = category;

    /** @inheritDoc */
    static KEY_GROUPS = Object.fromEntries(
      groups.flatMap(g => Object.keys(documentBehaviorConfig.categories[g].settings).map(k => [k, g])),
    );

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign({}, ...groups.map(g => settingsSchema(g, TernaryField, { initial: null })));
    }
  }

  return DocumentSettingsModel;
}

/**
 * @template {Teriock.Behavior.SettingsCategory} Category
 * @param {Category} category
 * @returns {Teriock.Models.UserSettingsModelConstructor<Category>}
 */
export function UserSettingsModelFactory(category) {
  class UserSettingsModel extends BaseDataModel {
    /** @inheritDoc */
    static defineSchema() {
      return settingsSchema(category, foundry.data.fields.BooleanField);
    }
  }

  return UserSettingsModel;
}
