import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import BaseMenu from "./base-menu.mjs";

/** @type {Record<Teriock.Config.SettingsCategory, { configKey: string, icon: string }>} */
const categoryConfigs = {
  ability: { configKey: "AbilitySettings", icon: icons.document.ability },
  actor: { configKey: "ActorSettings", icon: icons.document.character },
  armament: { configKey: "ArmamentSettings", icon: icons.target.weapon },
};

/**
 * @param {Teriock.Config.SettingsCategory} category
 */
function defineCategorySettingsConfig(category) {
  const { configKey, icon } = categoryConfigs[category];

  return class CategorySettingsConfig extends BaseMenu {
    /** @type {Partial<ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = {
      window: { icon: makeIconClass(icon, "title"), title: `TERIOCK.MENUS.${configKey}.name` },
    };

    /** @type {Record<string, HandlebarsTemplatePart>} */
    static PARTS = { settings: { template: "teriock/menus/base-menu" }, footer: super.PARTS.footer };

    /** @inheritDoc */
    static SETTINGS_MENU = {
      hint: `TERIOCK.MENUS.${configKey}.hint`,
      key: `${category}SettingsConfig`,
      label: `TERIOCK.MENUS.${configKey}.label`,
    };

    /** @inheritDoc */
    async _preparePartContext(partId, context, options) {
      context = await super._preparePartContext(partId, context, options);
      if (partId === "settings") {
        context.fields = this.createConfigurableSettingFields(category);
        context.legend = `TERIOCK.SETTINGS.${category}.name`;
      }
      return context;
    }
  };
}

export const AbilitySettingsMenu = defineCategorySettingsConfig("ability");
export const ActorSettingsMenu = defineCategorySettingsConfig("actor");
export const ArmamentSettingsMenu = defineCategorySettingsConfig("armament");
