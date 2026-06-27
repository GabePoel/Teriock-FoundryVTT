import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { settings } from "../../setup/system-settings.mjs";
import BaseConfig from "./base-config.mjs";

export default class GameMasterControlsConfig extends BaseConfig {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    window: {
      icon: makeIconClass(icons.settings.gameMasterControls, "title"),
      title: "TERIOCK.CONFIGS.GameMasterControls.name",
    },
  };

  /** @inheritDoc */
  static PARTS = {
    general: super.PARTS.general,
    secrets: { template: "teriock/settings/base-config" },
    developer: { template: "teriock/settings/base-config" },
    footer: super.PARTS.footer,
  };

  /** @inheritDoc */
  static SETTINGS_MENU = {
    hint: "TERIOCK.CONFIGS.GameMasterControls.hint",
    key: "gameMasterControlsConfig",
    label: "TERIOCK.CONFIGS.GameMasterControls.label",
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
        context.legend = "TERIOCK.CONFIGS.GameMasterControls.parts.secrets";
        break;
      case "developer":
        context.fields = this.createSettingFields(settings.developer);
        context.legend = "TERIOCK.CONFIGS.GameMasterControls.parts.developer";
        break;
      default:
        break;
    }
    return context;
  }
}
