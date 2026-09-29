import { TeriockContextMenu } from "../../../../../ux/_module.mjs";

/**
 * @import { ContextMenuEntry } from "@client/applications/ux/context-menu.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PlayableActorSheetSidebarPart(Base) {
  /** @mixin */
  class PlayableActorSheetSidebarPart extends Base {
    /**
     * Creates a context menu for selecting scaling type.
     * @returns {ContextMenuEntry[]}
     */
    #scalingContextMenu() {
      return TeriockContextMenu.makeUpdateEntries(this.actor, [{
        icon: teriock.data.systems.items.RankSystem.metadata.icon,
        label: _loc("TERIOCK.SHEETS.Actor.SIDEBAR.Scaling.type.lvl"),
        value: false,
      }, {
        icon: TERIOCK.display.icons.manifest.species.br,
        label: _loc("TERIOCK.SHEETS.Actor.SIDEBAR.Scaling.type.br"),
        value: true,
      }], { path: "system.scaling.brScale" });
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      this._createContextMenu(this.#scalingContextMenu, ".actor-basics", {
        eventName: "contextmenu",
        forceDirection: "down",
      });
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      return Object.assign(await super._prepareContext(options), { takeStatButtons: true });
    }
  }

  return PlayableActorSheetSidebarPart;
}
