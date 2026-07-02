import documentConfig from "../../../constants/config/document-config.mjs";
import { TeriockActor } from "../../../documents/_module.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import DocumentDirectoryMixin from "./document-directory-mixin.mjs";

const { ItemDirectory } = foundry.applications.sidebar.tabs;

/**
 * @extends {ItemDirectory}
 * @mixes TeriockDocumentDirectory
 */
export default class TeriockItemDirectory extends DocumentDirectoryMixin(ItemDirectory) {
  /** @inheritDoc */
  _getEntryContextOptions() {
    return [{
      icon: makeIconClass(documentConfig.creature.icon, "contextMenu"),
      label: "TERIOCK.SYSTEMS.Species.EMBED.makeCreature",
      onClick: async (_ev, li) => {
        const data = await this._getDocumentFromLi(li)?.system.toCreature();
        if (!data) { return; }
        TeriockActor.create(data, { renderSheet: true });
        ui.actors?.activate();
      },
      visible: li => this._getDocumentFromLi(li)?.type === "species" && game.user.hasPermission("ACTOR_CREATE"),
    }, ...super._getEntryContextOptions()];
  }
}
