import { bindCommonActions } from "../../applications/shared/_module.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";

/**
 * Add wiki open button to sheet header.
 * @param {TeriockBaseItemSheet|TeriockBaseEffectSheet} application
 * @param {ApplicationHeaderControlsEntry[]} controls
 */
function addWikiOpenToHeader(application, controls) {
  if (
    application.document.system.metadata.wiki &&
    application.document.system.isOnWiki
  ) {
    controls.push({
      action: "wikiOpenThis",
      icon: makeIconClass("globe", "contextMenu"),
      label: "View on Wiki",
    });
  }
}

export default function registerSheetManagementHooks() {
  foundry.helpers.Hooks.on(
    "renderJournalEntrySheet",
    /**
     * @param {ApplicationV2} _application
     * @param {HTMLElement} element
     */
    (_application, element) => {
      bindCommonActions(element);
    },
  );

  foundry.helpers.Hooks.on(
    "renderRollTableSheet",
    /**
     * @param {ApplicationV2} _application
     * @param {HTMLElement} element
     */
    (_application, element) => {
      bindCommonActions(element);
    },
  );

  foundry.helpers.Hooks.on(
    "getHeaderControlsWikiButtonSheet",
    addWikiOpenToHeader,
  );
}
