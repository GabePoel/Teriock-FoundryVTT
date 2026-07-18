import { getPackIcon } from "../../../helpers/html.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import { TeriockDragDrop } from "../../ux/_module.mjs";
import { TeriockCompendium } from "../apps/_module.mjs";

const { CompendiumDirectory } = foundry.applications.sidebar.tabs;

/** @inheritDoc */
export default class TeriockCompendiumDirectory extends CompendiumDirectory {
  /** @inheritDoc */
  async _onCreateEntry(event, target) {
    await super._onCreateEntry(event, target);
    // Force newly created compendiums to have the correct application class.
    for (const pack of game.packs) {
      if (!foundry.utils.isSubclass(pack.applicationClass, TeriockCompendium)) {
        pack.applicationClass = TeriockCompendium;
        // Foundry adds an initial application as part of the pack's creation before we can set the class. So, we need
        // to remove that starting class and add our own.
        pack.apps.length = 0;
        pack.apps.push(new pack.applicationClass({ collection: pack }));
      }
    }
  }

  /** @inheritDoc */
  _onDragDocumentStart(event) {
    super._onDragDocumentStart(event);
    TeriockDragDrop.setDefaultDragEventData(event);
  }

  /** @inheritDoc */
  _onMatchSearchDocuments(indexEntries, listEl) {
    super._onMatchSearchDocuments(indexEntries, listEl);
    const makeTooltips = game.settings.get("teriock", "compendiumTooltips");
    listEl.querySelectorAll("li.document-match[data-uuid]").forEach(/** @param {HTMLElement} el */ el => {
      const uuid = el.getAttribute("data-uuid");
      // Remove sub-documents. This requires pre-indexing the compendium packs.
      // The packs are pre-indexed in the "ready" hook.
      if (foundry.utils.getProperty(fromUuidSync(uuid), "system._sup")) { el.remove(); }
      // Enable tooltips for remaining search results
      else if (makeTooltips) { el.dataset.tooltipUuid = uuid; }
    });
  }

  /** @inheritDoc */
  _preparePackContext(pack) {
    // Allow use of custom compendium icons
    return Object.assign(super._preparePackContext(pack), { icon: makeIconClass(getPackIcon(pack), "solid") });
  }
}
