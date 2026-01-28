import { bindCommonActions } from "../../applications/shared/_module.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";

/**
 * Add wiki open button to sheet header.
 * @param {BaseItemSheet|BaseEffectSheet} application
 * @param {ApplicationHeaderControlsEntry[]} controls
 */
function addWikiOpenToHeader(application, controls) {
  if (
    application.document.metadata?.wiki &&
    application.document.system["isOnWiki"]
  ) {
    controls.push({
      action: "wikiOpenThis",
      icon: makeIconClass("globe", "contextMenu"),
      label: "View on Wiki",
    });
  }
}

/**
 * Add GM notes button to sheet header.
 * @param {BaseItemSheet|BaseEffectSheet} _application
 * @param {ApplicationHeaderControlsEntry[]} controls
 */
function addGmNotesToHeader(_application, controls) {
  if (game.user.isGM) {
    controls.push({
      action: "gmNotesOpen",
      icon: makeIconClass("notes", "contextMenu"),
      label: "Open GM Notes",
    });
  }
}

export default function registerSheetManagementHooks() {
  foundry.helpers.Hooks.on(
    "renderJournalEntrySheet",
    /**
     * @param {TeriockDocumentSheet} _application
     * @param {HTMLElement} element
     */
    (_application, element) => {
      bindCommonActions(element);
    },
  );

  foundry.helpers.Hooks.on(
    "renderRollTableSheet",
    /**
     * @param {TeriockDocumentSheet} _application
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

  foundry.helpers.Hooks.on(
    "getHeaderControlsGmNotesCommonSheetPart",
    addGmNotesToHeader,
  );

  foundry.helpers.Hooks.on(
    "getHeaderControlsDocumentSheetV2",
    /**
     * @param {DocumentSheetV2} _application
     * @param {ApplicationHeaderControlsEntry[]} controls
     */
    (_application, controls) => {
      controls.sort((a, b) =>
        game.i18n.format(a.label).localeCompare(game.i18n.format(b.label)),
      );
    },
  );
}
