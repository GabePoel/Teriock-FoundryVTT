import { makeIcon } from "../../helpers/utils.mjs";

/**
 * @param {typeof DocumentDirectory} Base
 */
export default function SidebarMixin(Base) {
  return (
    /**
     * @extends {DocumentDirectory}
     * @mixin
     */
    class Sidebar extends Base {
      static _entryPartial = "teriock/sidebar/document-partial";

      /**
       * Get the document that corresponds to a certain list item.
       * @param {HTMLLIElement} li
       * @returns {AnyCommonDocument}
       */
      _getDocumentFromLi(li) {
        /** @type {HTMLElement} */
        const entryElement = li.closest("[data-entry-id]");
        return this.collection.get(entryElement?.dataset.entryId);
      }

      /** @inheritDoc */
      _getEntryContextOptions() {
        return [{
          icon: makeIcon(TERIOCK.display.icons.ui.panel),
          label: _loc("TERIOCK.SHEETS.Panel.OPEN"),
          onClick: async (_ev, li) => this._getDocumentFromLi(li)?.openPanelSheet(),
          visible: li => {
            const document = this._getDocumentFromLi(li);
            return game.teriock.getSetting("openPanelContextMenuEntry")
              && typeof document?.system?._getPanelCardContextMenuEntry === "function" && document.isViewer;
          },
        }, ...super._getEntryContextOptions()];
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        return Object.assign(await super._prepareContext(options), {
          makeTooltips: game.teriock.getSetting("sidebarTooltips"),
        });
      }
    }
  );
}
