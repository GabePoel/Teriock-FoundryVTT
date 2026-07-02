import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import { settings } from "../../setup/system-settings.mjs";
import BaseMenu from "./base-menu.mjs";

export default class AlternateRulesMenu extends BaseMenu {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    window: { icon: makeIconClass(icons.settings.alternateRules, "title"), title: "TERIOCK.MENUS.AlternateRules.name" },
  };

  /** @inheritDoc */
  static PARTS = {
    armor: { template: "teriock/menus/base-menu" },
    cones: { template: "teriock/menus/base-menu" },
    footer: super.PARTS.footer,
  };

  /** @inheritDoc */
  static SETTINGS_MENU = {
    hint: "TERIOCK.MENUS.AlternateRules.hint",
    key: "alternateRulesConfig",
    label: "TERIOCK.MENUS.AlternateRules.label",
    restricted: true,
  };

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    switch (partId) {
      case "armor":
        context.fields = this.createSettingFields(settings.armor);
        context.legend = "TERIOCK.MENUS.AlternateRules.parts.armor";
        break;
      case "cones":
        context.fields = this.createSettingFields(settings.cone);
        context.legend = "TERIOCK.MENUS.AlternateRules.parts.cones";
        break;
      default:
        break;
    }
    return context;
  }
}
