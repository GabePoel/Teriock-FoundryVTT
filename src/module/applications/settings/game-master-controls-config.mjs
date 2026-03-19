import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { settings } from "../../setup/system-settings.mjs";
import BaseConfig from "./base-config.mjs";

export default class GameMasterControlsConfig extends BaseConfig {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    window: {
      title: "TERIOCK.CONFIGS.GameMasterControls.name",
      icon: makeIconClass(icons.settings.gameMasterControls, "title"),
    },
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
    }
    return context;
  }
}
