import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { settings } from "../../setup/system-settings.mjs";
import BaseConfig from "./base-config.mjs";

export default class GameContentConfig extends BaseConfig {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    window: {
      icon: makeIconClass(icons.settings.automatedBehavior, "title"),
      title: "TERIOCK.CONFIGS.AutomatedBehavior.name",
    },
  };

  /** @inheritDoc */
  static PARTS = {
    general: super.PARTS.general,
    armaments: { template: "teriock/settings/base-config" },
    footer: super.PARTS.footer,
  };

  /** @inheritDoc */
  static SETTINGS_MENU = {
    hint: "TERIOCK.CONFIGS.AutomatedBehavior.hint",
    key: "automatedBehaviorConfig",
    label: "TERIOCK.CONFIGS.AutomatedBehavior.label",
  };

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    switch (partId) {
      case "general":
        context.fields = this.createSettingFields(settings.automatedBehavior);
        break;
      default:
        break;
    }
    switch (partId) {
      case "armaments":
        context.fields = this.createSettingFields(settings.armament);
        context.legend = "TERIOCK.CONFIGS.AutomatedBehavior.parts.armaments";
        break;
      default:
        break;
    }
    return context;
  }
}
