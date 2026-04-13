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
      label: _loc("TERIOCK.SYSTEMS.Common.MENU.viewOnWiki"),
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
    label: _loc("TERIOCK.SYSTEMS.Child.MENU.shareInChat"),
    onClick: () => {
      chatImage(application.options.src);
    },
  });
}

/**
 * Add the entries from {@link BaseDocument.getCardContextMenuEntries} to sheet header.
 * @param {TeriockDocumentSheet} application
 * @param {ApplicationHeaderControlsEntry[]} controls
 */
function addCardContextMenuEntriesToHeader(application, controls) {
  if (typeof application.document?.getCardContextMenuEntries !== "function") {
    return;
  }
  const entries = application.document.getCardContextMenuEntries(
    application.document,
  );
  const groups = {};
  const ungrouped = [];
  const sorted = [];
  entries.forEach((entry) => {
    if (entry.group && !groups[entry.group]) groups[entry.group] = [];
    if (entry.group) groups[entry.group].push(entry);
    else ungrouped.push(entry);
  });
  Object.values(groups).forEach((g) => sorted.push(...g));
  sorted.push(...ungrouped);
  controls.push(
    ...entries.map((e) => {
      return {
        group: e.group,
        icon: e.icon.split('class="')[1].split('">')[0],
        label: e.label,
        onClick: e.onClick,
        visible: e.visible,
      };
    }),
  );
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
    "getHeaderControlsImagePopout",
    addShareImageToHeader,
  );

  foundry.helpers.Hooks.on(
    "getHeaderControlsActorSheetV2",
    /**
     * @param {DocumentSheetV2} _application
     * @param {ApplicationHeaderControlsEntry[]} controls
     */
    (_application, controls) => {
      controls.sort((a, b) => _loc(a.label).localeCompare(_loc(b.label)));
    },
  );

  foundry.helpers.Hooks.on(
    "getHeaderControlsDocumentSheetV2",
    addCardContextMenuEntriesToHeader,
  );
}
