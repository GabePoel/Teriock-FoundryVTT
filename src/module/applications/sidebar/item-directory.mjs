import { systemPath } from "../../helpers/path.mjs";
import { bindCommonActions } from "../shared/_module.mjs";

const { ItemDirectory } = foundry.applications.sidebar.tabs;

export default class TeriockItemDirectory extends ItemDirectory {
  static _entryPartial = systemPath("templates/sidebar/document-partial.hbs");

  async _onRender(context, options) {
    await super._onRender(context, options);
    if (game.settings.get("teriock", "sidebarTooltips")) {
      bindCommonActions(this.element);
    }
  }
}
