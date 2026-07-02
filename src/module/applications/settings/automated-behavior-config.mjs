import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import { settings } from "../../setup/system-settings.mjs";
import BaseConfig from "./base-config.mjs";

export default class AutomatedBehaviorConfig extends BaseConfig {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    window: {
      icon: makeIconClass(icons.settings.automatedBehavior, "title"),
      title: "TERIOCK.CONFIGS.AutomatedBehavior.name",
    },
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
    if (partId === "general") { context.fields = this.createSettingFields(settings.automatedBehavior); }
    return context;
  }
}
