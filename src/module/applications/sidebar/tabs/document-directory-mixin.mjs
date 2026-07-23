import { makeIcon } from "../../../helpers/icon.mjs";

/**
 * @param {typeof DocumentDirectory} Base
 */
export default function DocumentDirectoryMixin(Base) {
  return (
    /**
     * @extends {DocumentDirectory}
     * @mixin
     */
    class TeriockDocumentDirectory extends Base {
      static _entryPartial = "teriock/sidebar/document-partial";

      /** @inheritDoc */
      _createDroppedEntry(entry, updates = {}) {
        if (foundry.utils.getProperty(entry, "system._sup")) { updates["system._sup"] = null; }
        return super._createDroppedEntry(entry, updates);
      }

      /** @inheritDoc */
      _entryAlreadyExists(entry) {
        return super._entryAlreadyExists(entry) && !foundry.utils.getProperty(entry, "system._sup");
      }

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
            return game.settings.get("teriock", "openPanelContextMenuEntry")
              && typeof document?.system?._getPanelCardContextMenuEntry === "function" && document.isViewer;
          },
        }, ...super._getEntryContextOptions()];
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        return Object.assign(await super._prepareContext(options), {
          makeTooltips: game.settings.get("teriock", "sidebarTooltips"),
        });
      }
    }
  );
}
