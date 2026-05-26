import { documentConfig } from "../../constants/config/document-config.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import SidebarMixin from "./sidebar-mixin.mjs";

const { ItemDirectory } = foundry.applications.sidebar.tabs;

/**
 * @extends {ItemDirectory}
 * @mixes Sidebar
 */
export default class TeriockItemDirectory extends SidebarMixin(ItemDirectory) {
  /** @inheritDoc */
  _getEntryContextOptions() {
    return [{
      icon: makeIconClass(documentConfig.creature.icon, "contextMenu"),
      label: "TERIOCK.SYSTEMS.Species.EMBED.makeCreature",
      onClick: async (_ev, li) => {
        const data = await this._getDocumentFromLi(li)?.system.toCreature();
        if (!data) return;
        Actor.implementation.create(data, { renderSheet: true });
      },
      visible: li => this._getDocumentFromLi(li)?.type === "species" && game.user.hasPermission("ACTOR_CREATE"),
    }, ...super._getEntryContextOptions()];
  }
}
