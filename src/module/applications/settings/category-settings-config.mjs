import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import BaseConfig from "./base-config.mjs";

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

  return class CategorySettingsConfig extends BaseConfig {
    /** @inheritDoc */
    static DEFAULT_OPTIONS = {
      window: { icon: makeIconClass(icon, "title"), title: `TERIOCK.CONFIGS.${configKey}.name` },
    };

    /** @inheritDoc */
    static PARTS = { settings: { template: "teriock/settings/base-config" }, footer: super.PARTS.footer };

    /** @inheritDoc */
    static SETTINGS_MENU = {
      hint: `TERIOCK.CONFIGS.${configKey}.hint`,
      key: `${category}SettingsConfig`,
      label: `TERIOCK.CONFIGS.${configKey}.label`,
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

export const AbilitySettingsConfig = defineCategorySettingsConfig("ability");
export const ActorSettingsConfig = defineCategorySettingsConfig("actor");
export const ArmamentSettingsConfig = defineCategorySettingsConfig("armament");
