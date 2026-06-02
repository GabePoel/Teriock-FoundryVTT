import { getPackIcon } from "../../helpers/html.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";

const { CompendiumDirectory } = foundry.applications.sidebar.tabs;

export default class TeriockCompendiumDirectory extends CompendiumDirectory {
  /** @inheritDoc */
  _onMatchSearchDocuments(indexEntries, listEl) {
    super._onMatchSearchDocuments(indexEntries, listEl);
    const makeTooltips = game.teriock.getSetting("compendiumTooltips");
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
