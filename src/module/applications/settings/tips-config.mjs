import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { settings } from "../../setup/system-settings.mjs";
import BaseConfig from "./base-config.mjs";

export default class TipsConfig extends BaseConfig {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    window: { icon: makeIconClass(icons.settings.tips, "title"), title: "TERIOCK.CONFIGS.Tips.name" },
  };

  /** @inheritDoc */
  static PARTS = {
    suppression: { template: "teriock/settings/base-config" },
    error: { template: "teriock/settings/base-config" },
    footer: super.PARTS.footer,
  };

  /** @inheritDoc */
  static SETTINGS_MENU = { hint: "TERIOCK.CONFIGS.Tips.hint", key: "tipsConfig", label: "TERIOCK.CONFIGS.Tips.label" };

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    switch (partId) {
      case "suppression":
        context.fields = this.createSettingFields(settings.suppression);
        for (const field of context.fields) {
          if (field.name === "suppressionMessageTypes" || field.name === "suppressionMessages") {
            field.classes = "stacked";
          }
        }
        context.legend = "TERIOCK.CONFIGS.Tips.parts.suppression";
        break;
      case "error":
        context.fields = this.createSettingFields(settings.error);
        for (const field of context.fields) {
          if (field.name === "errorMessages") { field.classes = "stacked"; }
        }
        context.legend = "TERIOCK.CONFIGS.Tips.parts.error";
        break;
      default:
        break;
    }
    return context;
  }
}
