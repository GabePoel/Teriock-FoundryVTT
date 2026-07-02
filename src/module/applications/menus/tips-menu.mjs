import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import { settings } from "../../setup/system-settings.mjs";
import BaseMenu from "./base-menu.mjs";

export default class TipsMenu extends BaseMenu {
  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    window: { icon: makeIconClass(icons.settings.tips, "title"), title: "TERIOCK.MENUS.Tips.name" },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    suppression: { template: "teriock/menus/base-menu" },
    error: { template: "teriock/menus/base-menu" },
    footer: super.PARTS.footer,
  };

  /** @inheritDoc */
  static SETTINGS_MENU = { hint: "TERIOCK.MENUS.Tips.hint", key: "tipsConfig", label: "TERIOCK.MENUS.Tips.label" };

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
        context.legend = "TERIOCK.MENUS.Tips.parts.suppression";
        break;
      case "error":
        context.fields = this.createSettingFields(settings.error);
        for (const field of context.fields) {
          if (field.name === "errorMessages") { field.classes = "stacked"; }
        }
        context.legend = "TERIOCK.MENUS.Tips.parts.error";
        break;
      default:
        break;
    }
    return context;
  }
}
