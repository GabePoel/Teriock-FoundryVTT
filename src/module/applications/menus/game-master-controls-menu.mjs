import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import { settings } from "../../setup/system-settings.mjs";
import BaseMenu from "./base-menu.mjs";

export default class GameMasterControlsMenu extends BaseMenu {
  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    window: {
      icon: makeIconClass(icons.settings.gameMasterControls, "title"),
      title: "TERIOCK.MENUS.GameMasterControls.name",
    },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    general: super.PARTS.general,
    secrets: { template: "teriock/menus/base-menu" },
    developer: { template: "teriock/menus/base-menu" },
    footer: super.PARTS.footer,
  };

  /** @inheritDoc */
  static SETTINGS_MENU = {
    hint: "TERIOCK.MENUS.GameMasterControls.hint",
    key: "gameMasterControlsConfig",
    label: "TERIOCK.MENUS.GameMasterControls.label",
    restricted: true,
  };

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    switch (partId) {
      case "general":
        context.fields = this.createSettingFields(settings.gameMasterControls);
        break;
      case "secrets":
        context.fields = this.createSettingFields(settings.secrets);
        context.legend = "TERIOCK.MENUS.GameMasterControls.parts.secrets";
        break;
      case "developer":
        context.fields = this.createSettingFields(settings.developer);
        context.legend = "TERIOCK.MENUS.GameMasterControls.parts.developer";
        break;
      default:
        break;
    }
    return context;
  }
}
