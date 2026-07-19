import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import { settings } from "../../setup/system-settings.mjs";
import BaseMenu from "./base-menu.mjs";

export default class DisplayMenu extends BaseMenu {
  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    window: { icon: makeIconClass(icons.settings.display, "title"), title: "TERIOCK.MENUS.Display.name" },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    general: super.PARTS.general,
    actorSheet: { template: "teriock/menus/base-menu" },
    dragDrop: { template: "teriock/menus/base-menu" },
    panels: { template: "teriock/menus/base-menu" },
    tooltips: { template: "teriock/menus/base-menu" },
    footer: super.PARTS.footer,
  };

  /** @inheritDoc */
  static SETTINGS_MENU = {
    hint: "TERIOCK.MENUS.Display.hint",
    key: "displayConfig",
    label: "TERIOCK.MENUS.Display.label",
  };

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    switch (partId) {
      case "general":
        context.fields = this.createSettingFields(settings.generalDisplay);
        break;
      case "panels":
        context.fields = this.createSettingFields(settings.panel);
        context.legend = "TERIOCK.MENUS.Display.parts.panels";
        break;
      case "tooltips":
        context.fields = this.createSettingFields(settings.tooltip);
        context.legend = "TERIOCK.MENUS.Display.parts.tooltips";
        break;
      case "actorSheet":
        context.fields = this.createSettingFields(settings.actorSheet);
        context.legend = "TERIOCK.MENUS.Display.parts.actorSheets";
        break;
      case "dragDrop":
        context.fields = this.createSettingFields(settings.dragDrop);
        context.legend = "TERIOCK.MENUS.Display.parts.dragDrop";
        break;
      default:
        break;
    }
    return context;
  }
}
