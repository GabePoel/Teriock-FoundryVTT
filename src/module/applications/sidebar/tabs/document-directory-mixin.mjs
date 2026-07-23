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

      /**
       * The settings key for whether this should have tooltips.
       * @returns {string}
       */
      get _tooltipSettingsKey() {
        return "sidebarTooltips";
      }

      /** @inheritDoc */
      _createDroppedEntry(entry, updates = {}) {
        if (!foundry.utils.getProperty(entry, "system._sup")) { return super._createDroppedEntry(entry, updates); }
        entry = entry.clone({ ...updates, "system._sup": null }, { keepId: true });
        return this.collection.importDocument(entry, { dialog: true, keepId: false });
      }

      /** @inheritDoc */
      _entryAlreadyExists(entry) {
        return super._entryAlreadyExists(entry) && !foundry.utils.getProperty(entry, "system._sup");
      }

      /** @inheritDoc */
      _getEntryContextOptions() {
        return [{
          icon: makeIcon(TERIOCK.display.icons.ui.panel),
          label: _loc("TERIOCK.SHEETS.Panel.OPEN"),
          visible: this._validateOpenPanelEntryContextOption.bind(this),
          onClick: async (_ev, li) => (await this._getEntryFromLi(li))?.openPanelSheet(),
        }, ...super._getEntryContextOptions()];
      }

      /**
       * Get the document that corresponds to a certain list item.
       * @param {HTMLLIElement} li
       * @returns {AnyCommonDocument}
       */
      _getEntryFromLi(li) {
        return this.collection.get(li.closest("[data-entry-id]")?.dataset.entryId);
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        return Object.assign(await super._prepareContext(options), {
          makeTooltips: game.settings.get("teriock", this._tooltipSettingsKey),
        });
      }

      /**
       * Validate whether the open panel context menu entry option should be visible.
       * @param {HTMLLIElement} li
       * @returns {boolean}
       */
      _validateOpenPanelEntryContextOption(li) {
        const document = this._getEntryFromLi(li);
        return game.settings.get("teriock", "openPanelContextMenuEntry")
          && typeof document?.system?._getPanelCardContextMenuEntry === "function" && document.isViewer;
      }
    }
  );
}
