import { bindCommonActions } from "../../applications/shared/_module.mjs";
import { chatImage } from "../../applications/shared/image-context-menu-options.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";

/**
 * Add the entries from {@link BaseDocument.getCardContextMenuEntries} to sheet header.
 * @param {DocumentSheetV2 & { document: TeriockDocument }} application
 * @param {ApplicationHeaderControlsEntry[]} controls
 * @see {getHeaderControlsApplicationV2}
 */
function addCardContextMenuEntriesToHeader(application, controls) {
  if (!application.window.header) return;
  const document = application.document;
  if (typeof document.getCardContextMenuEntries !== "function") return;
  const entries = document.getCardContextMenuEntries(document);
  const groups = {};
  const ungrouped = [];
  const sorted = [];
  // TODO: Fully commit to either grouped or ungrouped
  // We sort entries by group, but this isn't really necessary since we sort alphabetically anyway
  entries.forEach(entry => {
    if (entry.group && !groups[entry.group]) groups[entry.group] = [];
    if (entry.group) groups[entry.group].push(entry);
    else ungrouped.push(entry);
  });
  Object.values(groups).forEach(g => sorted.push(...g));
  sorted.push(...ungrouped);
  controls.push(
    ...entries.map(e => {
      return {
        group: e.group,
        icon: e.icon.split('class="')[1].split('">')[0],
        label: e.label,
        onClick: e.onClick,
        visible: e.visible,
      };
    }),
  );
  sortControls(application, controls);
}

/**
 * Adds a right-click option to the close button in all applications.
 * @param {ApplicationV2|DocumentSheetV2} application
 * @see {renderApplicationV2}
 */
function addDeveloperModeLoggingListener(application) {
  if (!game.teriock.getSetting("developerMode") || !application.window.header) {
    return;
  }
  application.window.header.querySelectorAll("[data-action=close]").forEach(el => {
    el.addEventListener("contextmenu", async e => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      console.warn("Debug Application:");
      console.log("Application", application);
      if (application.document) console.log("Document", application.document);
      if (typeof application._prepareContext === "function") {
        const context = await application._prepareContext({
          force: false,
          isFirstRender: false,
        });
        console.log("Context", context);
      }
    });
  });
}

/**
 * Adds a middle click option to the copy UUID button in sheet headers.
 * @param {DocumentSheetV2} application
 * @see {renderApplicationV2}
 */
function addIdentifierClipboardListener(application) {
  if (!application.window.header) return;
  const type = _loc("TERIOCK.TERMS.Common.identifier").toLowerCase();
  const label = _loc(application.document.constructor.metadata.label);
  application.window.header.querySelectorAll("[data-action=copyUuid]").forEach(el =>
    el.addEventListener("auxclick", e => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const id = application.document?.typedIdentifier;
      if (!id) {
        ui.notifications.warn("TERIOCK.SHEETS.Common.NOTIFICATIONS.noIdentifier", {
          format: { label },
          localize: true,
        });
        return;
      }
      game.clipboard.copyPlainText(id);
      ui.notifications.info("DOCUMENT.IdCopiedClipboard", {
        format: { label, type, id },
      });
    }),
  );
}

/**
 * Add a button to share image in chat to the header.
 * @param {ImagePopout & {options: ApplicationConfiguration & ImagePopoutConfiguration}} application
 * @param {ApplicationHeaderControlsEntry[]} controls
 * @see {getHeaderControlsApplicationV2}
 */
function addShareImageToHeader(application, controls) {
  if (!application.window.header) return;
  controls.push({
    action: "shareImageInChat",
    icon: makeIconClass(TERIOCK.display.icons.ui.shareImage, "contextMenu"),
    label: _loc("TERIOCK.SYSTEMS.Child.MENU.shareInChat"),
    onClick: () => chatImage(application.options.src),
  });
}

/**
 * Add a wiki open button to the sheet header.
 * @param {BaseItemSheet|BaseEffectSheet} application
 * @param {ApplicationHeaderControlsEntry[]} controls
 * @see {getHeaderControlsApplicationV2}
 */
function addWikiOpenToHeader(application, controls) {
  if (!application.window.header) return;
  if (application.document.metadata?.wiki && application.document.system["isOnWiki"]) {
    controls.push({
      action: "wikiOpenThis",
      icon: makeIconClass(TERIOCK.display.icons.ui.wiki, "contextMenu"),
      label: _loc("TERIOCK.SYSTEMS.Common.MENU.viewOnWiki"),
    });
  }
}

/**
 * @param {TeriockDocumentSheet} _application
 * @param {HTMLElement} element
 * @see {renderApplicationV2}
 */
function bindCommonActionsToElement(_application, element) {
  bindCommonActions(element);
}

/**
 * @param {DocumentSheetV2} _application
 * @param {ApplicationHeaderControlsEntry[]} controls
 * @see {getHeaderControlsApplicationV2}
 */
function sortControls(_application, controls) {
  for (const c of controls) c.label = _loc(c.label);
  controls = game.i18n.sortObjects(controls, "label");
  controls.sort((a, b) => {
    const getOrder = control => {
      if (control.action === "attach") return 1;
      if (control.action === "detach") return 2;
      if (control.icon?.includes("delete")) return 4;
      return 3;
    };
    return getOrder(a) - getOrder(b);
  });
}

const applicationHookEntries = [
  ["getHeaderControlsBaseApplication", sortControls],
  ["getHeaderControlsDocumentSheetV2", addCardContextMenuEntriesToHeader],
  ["getHeaderControlsImagePopout", addShareImageToHeader],
  ["getHeaderControlsWikiButtonSheet", addWikiOpenToHeader],
  ["renderApplicationV2", addDeveloperModeLoggingListener],
  ["renderDocumentSheetV2", addIdentifierClipboardListener],
  ["renderJournalEntrySheet", bindCommonActionsToElement],
  ["renderRollTableSheet", bindCommonActionsToElement],
];

export default applicationHookEntries;
