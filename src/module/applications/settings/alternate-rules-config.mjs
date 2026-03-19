import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { settings } from "../../setup/system-settings.mjs";
import BaseConfig from "./base-config.mjs";

export default class AlternateRulesConfig extends BaseConfig {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    window: {
      title: "TERIOCK.CONFIGS.AlternateRules.name",
      icon: makeIconClass(icons.settings.alternateRules, "title"),
    },
  };

  /** @inheritDoc */
  static PARTS = {
    armor: { template: "teriock/settings/base-config" },
    cones: { template: "teriock/settings/base-config" },
    footer: super.PARTS.footer,
  };

  /** @inheritDoc */
  static SETTINGS_MENU = {
    hint: "TERIOCK.CONFIGS.AlternateRules.hint",
    key: "alternateRulesConfig",
    label: "TERIOCK.CONFIGS.AlternateRules.label",
    restricted: true,
  };

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    switch (partId) {
      case "armor":
        context.fields = this.createSettingFields(settings.armor);
        context.legend = "TERIOCK.CONFIGS.AlternateRules.parts.armor";
        break;
      case "cones":
        context.fields = this.createSettingFields(settings.cone);
        context.legend = "TERIOCK.CONFIGS.AlternateRules.parts.cones";
        break;
    }
    return context;
  }
}
