import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { settings } from "../../setup/system-settings.mjs";
import BaseConfig from "./base-config.mjs";

export default class GameContentConfig extends BaseConfig {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    window: {
      icon: makeIconClass(icons.settings.gameContent, "title"),
      title: "TERIOCK.CONFIGS.GameContent.name",
    },
  };

  /** @inheritDoc */
  static SETTINGS_MENU = {
    hint: "TERIOCK.CONFIGS.GameContent.hint",
    key: "gameContentConfig",
    label: "TERIOCK.CONFIGS.GameContent.label",
    restricted: true,
  };

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    switch (partId) {
      case "general":
        context.fields = this.createSettingFields(settings.gameContent);
        break;
    }
    return context;
  }
}
