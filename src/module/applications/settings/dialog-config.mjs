import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { settings } from "../../setup/system-settings.mjs";
import BaseConfig from "./base-config.mjs";

export default class DialogConfig extends BaseConfig {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    window: { icon: makeIconClass(icons.settings.dialog, "title"), title: "TERIOCK.CONFIGS.Dialog.name" },
  };

  /** @inheritDoc */
  static SETTINGS_MENU = {
    hint: "TERIOCK.CONFIGS.Dialog.hint",
    key: "dialogConfig",
    label: "TERIOCK.CONFIGS.Dialog.label",
  };

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    switch (partId) {
      case "general":
        context.fields = this.createSettingFields(settings.dialog);
        break;
    }
    return context;
  }
}
