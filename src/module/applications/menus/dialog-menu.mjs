import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import { settings } from "../../setup/system-settings.mjs";
import BaseMenu from "./base-menu.mjs";

export default class DialogMenu extends BaseMenu {
  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    window: { icon: makeIconClass(icons.settings.dialog, "title"), title: "TERIOCK.MENUS.Dialog.name" },
  };

  /** @inheritDoc */
  static SETTINGS_MENU = {
    hint: "TERIOCK.MENUS.Dialog.hint",
    key: "dialogConfig",
    label: "TERIOCK.MENUS.Dialog.label",
  };

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (partId === "general") { context.fields = this.createSettingFields(settings.dialog); }
    return context;
  }
}
