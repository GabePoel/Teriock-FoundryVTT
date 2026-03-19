import { bindCommonActions } from "../../applications/shared/_module.mjs";
import { chatImage } from "../../applications/shared/image-context-menu-options.mjs";
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
      icon: makeIconClass(TERIOCK.display.icons.ui.wiki, "contextMenu"),
      label: game.i18n.localize("TERIOCK.SYSTEMS.Common.MENU.viewOnWiki"),
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
      icon: makeIconClass(TERIOCK.display.icons.ui.notes, "contextMenu"),
      label: game.i18n.localize("TERIOCK.SYSTEMS.Child.MENU.openGmNotes"),
    });
  }
}

/**
 * Add share image in chat button to image popout header.
 * @param {ImagePopout} application
 * @param {ApplicationHeaderControlsEntry[]} controls
 */
function addShareImageToHeader(application, controls) {
  controls.push({
    action: "shareImageInChat",
    icon: makeIconClass(TERIOCK.display.icons.ui.shareImage, "contextMenu"),
    label: game.i18n.localize("TERIOCK.SYSTEMS.Child.MENU.shareInChat"),
    onClick: () => {
      chatImage(application.options.src);
    },
  });
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
    "getHeaderControlsImagePopout",
    addShareImageToHeader,
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
