import settingsConfig from "../../constants/config/settings-config.mjs";
import { icons } from "../../constants/display/icons.mjs";
import { userSettingsModels } from "../../data/models/settings-models/_module.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import BaseMenu from "./base-menu.mjs";

/** @type {Record<Teriock.Config.SettingsCategory, string>} */
const categoryIcons = {
  ability: icons.document.ability,
  actor: icons.document.character,
  armament: icons.target.weapon,
  consumable: icons.ui.quantity,
  equipment: icons.document.equipment,
};

const categories = Object.keys(settingsConfig.categories);

/**
 * Menu for configuring default document behavior.
 */
export default class DocumentBehaviorMenu extends BaseMenu {
  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    window: { icon: makeIconClass(icons.ui.configure, "title"), title: "TERIOCK.MENUS.DocumentBehavior.name" },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    ...Object.fromEntries(categories.map(category => [category, { template: "teriock/menus/tabbed-menu" }])),
    footer: super.PARTS.footer,
  };

  /** @inheritDoc */
  static SETTINGS_MENU = {
    hint: "TERIOCK.MENUS.DocumentBehavior.hint",
    key: "documentBehaviorConfig",
    label: "TERIOCK.MENUS.DocumentBehavior.label",
  };

  /** @type {Record<string, Partial<ApplicationTabsConfiguration>>} */
  static TABS = {
    primary: {
      initial: "ability",
      labelPrefix: "TERIOCK.MENUS.DocumentBehavior.tabs",
      tabs: categories.map(category => ({ icon: makeIconClass(categoryIcons[category], "solid"), id: category })),
    },
  };

  /**
   * Create form fields for a configurable settings category stored as a data model.
   * @param {Teriock.Config.SettingsCategory} category
   * @returns {object[]}
   */
  #createConfigurableSettingFields(category) {
    const value = game.settings.get("teriock", category) ?? {};
    const Model = userSettingsModels[category];
    const schemaFields = new Model().schema.fields;
    return Object.keys(settingsConfig.categories[category]).map(key => ({
      field: schemaFields[key],
      hint: schemaFields[key].hint,
      label: schemaFields[key].label,
      localize: true,
      name: `${category}.${key}`,
      value: value[key],
    }));
  }

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    context.tabClasses = "top-tabs";
    if (categories.includes(partId)) { context.fields = this.#createConfigurableSettingFields(partId); }
    return context;
  }
}
