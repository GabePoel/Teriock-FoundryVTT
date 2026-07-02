import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import { settings } from "../../setup/system-settings.mjs";
import BaseMenu from "./base-menu.mjs";

export default class AutomatedBehaviorMenu extends BaseMenu {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    window: {
      icon: makeIconClass(icons.settings.automatedBehavior, "title"),
      title: "TERIOCK.MENUS.AutomatedBehavior.name",
    },
  };

  /** @inheritDoc */
  static SETTINGS_MENU = {
    hint: "TERIOCK.MENUS.AutomatedBehavior.hint",
    key: "automatedBehaviorConfig",
    label: "TERIOCK.MENUS.AutomatedBehavior.label",
  };

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (partId === "general") { context.fields = this.createSettingFields(settings.automatedBehavior); }
    return context;
  }
}
