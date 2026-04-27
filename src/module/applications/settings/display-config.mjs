import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { settings } from "../../setup/system-settings.mjs";
import BaseConfig from "./base-config.mjs";

export default class DisplayConfig extends BaseConfig {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    window: {
      icon: makeIconClass(icons.settings.display, "title"),
      title: "TERIOCK.CONFIGS.Display.name",
    },
  };

  /** @inheritDoc */
  static PARTS = {
    general: super.PARTS.general,
    panels: { template: "teriock/settings/base-config" },
    tooltips: { template: "teriock/settings/base-config" },
    actorSheet: { template: "teriock/settings/base-config" },
    footer: super.PARTS.footer,
  };

  /** @inheritDoc */
  static SETTINGS_MENU = {
    hint: "TERIOCK.CONFIGS.Display.hint",
    key: "displayConfig",
    label: "TERIOCK.CONFIGS.Display.label",
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
        context.legend = "TERIOCK.CONFIGS.Display.parts.panels";
        break;
      case "tooltips":
        context.fields = this.createSettingFields(settings.tooltip);
        context.legend = "TERIOCK.CONFIGS.Display.parts.tooltips";
        break;
      case "actorSheet":
        context.fields = this.createSettingFields(settings.actorSheet);
        context.legend = "TERIOCK.CONFIGS.Display.parts.actorSheets";
        break;
    }
    return context;
  }
}
