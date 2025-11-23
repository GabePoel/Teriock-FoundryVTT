import { systemPath } from "../../helpers/path.mjs";
import { bindCommonActions } from "../shared/_module.mjs";

const { Compendium } = foundry.applications.sidebar.apps;

export default class TeriockCompendium extends Compendium {
  static _entryPartial = systemPath("templates/sidebar/index-partial.hbs");

  async _onRender(context, options) {
    await super._onRender(context, options);
    if (game.settings.get("teriock", "compendiumTooltips")) {
      bindCommonActions(this.element);
    }
  }
}
