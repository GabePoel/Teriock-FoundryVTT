import { PanelSheet } from "../../applications/sheets/utility-sheets/_module.mjs";
import { TeriockChatMessage } from "../../documents/_module.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";

/**
 * Add the entries from {@link BaseDocument.getCardContextMenuEntries} to sheet header.
 * @param {DocumentSheetV2 & { document: TeriockDocument }} application
 * @param {ApplicationHeaderControlsEntry[]} controls
 * @see {getHeaderControlsApplicationV2}
 */
function addCardContextMenuEntriesToHeader(application, controls) {
  if (!application.window.header) { return; }
  const document = application.document;
  if (typeof document.getCardContextMenuEntries !== "function") { return; }
  const entries = document.getCardContextMenuEntries(document);
  controls.push(
    ...entries.filter(e =>
      e.label !== _loc("SIDEBAR.DUPLICATE")
      && ((e.label !== _loc("TERIOCK.SHEETS.Panel.OPEN")) || !(application instanceof PanelSheet))
    ).map(e => {
      return {
        group: e.group,
        icon: e.icon?.split("class=\"")[1]?.split("\">")[0] ?? e.icon,
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
  if (!game.settings.get("teriock", "developerMode") || !application.window.header) { return; }
  application.window.header.querySelectorAll("[data-action=close]").forEach(el => {
    el.addEventListener("contextmenu", async e => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      console.warn("Debug Application:");
      console.log("Application", application);
      if (application.document) {
        console.log("Document", application.document);
        if (typeof application.document.getRollData === "function") {
          console.log("Roll Data", application.document.getRollData());
        }
      }
      if (typeof application._prepareContext === "function") {
        const context = await application._prepareContext({ force: false, isFirstRender: false });
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
  if (!application.window.header) { return; }
  const type = _loc("TERIOCK.TERMS.Common.identifier").toLowerCase();
  const label = _loc(application.document.constructor.metadata.label);
  application.window.header.querySelectorAll("[data-action=copyUuid]").forEach(el =>
    el.addEventListener("auxclick", async e => {
      if (e.button !== 1) { return; }
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const id = application.document?.typedIdentifier;
      if (!id || application.document?.isSecret) {
        ui.notifications.warn("TERIOCK.SHEETS.Common.NOTIFICATIONS.noIdentifier", {
          format: { label },
          localize: true,
        });
        return;
      }
      await game.clipboard.copyPlainText(id);
      ui.notifications.info("DOCUMENT.IdCopiedClipboard", { format: { id, label, type } });
    })
  );
}

/**
 * Change the color of headers for documents in compendiums.
 * @param {DocumentSheetV2} application
 */
function recolorCompendiumDocumentHeader(application) {
  if (!application.window.header) { return; }
  if (application.document?.inCompendium) {
    application.window.header.style.backgroundColor = "var(--compendium-sheet-header-background-color)";
  }
}

/**
 * Add a button to share image in chat to the header.
 * @param {ImagePopout & {options: ApplicationConfiguration & ImagePopoutConfiguration}} application
 * @param {ApplicationHeaderControlsEntry[]} controls
 * @see {getHeaderControlsApplicationV2}
 */
function addShareImageToHeader(application, controls) {
  if (!application.window.header) { return; }
  controls.push({
    action: "shareImageInChat",
    icon: makeIconClass(TERIOCK.display.icons.ui.shareImage, "contextMenu"),
    label: _loc("TERIOCK.SYSTEMS.Child.MENU.shareInChat"),
    onClick: () => TeriockChatMessage.fromImg(application.options.src),
  });
}

/**
 * Add a wiki open button to the sheet header.
 * @param {ChildSheet} application
 * @param {ApplicationHeaderControlsEntry[]} controls
 * @see {getHeaderControlsApplicationV2}
 */
function addWikiOpenToHeader(application, controls) {
  if (!application.window.header) { return; }
  if (application.document.system?.metadata?.wiki && application.document.system.isOnWiki) {
    controls.push({
      action: "wikiOpenThis",
      icon: makeIconClass(TERIOCK.display.icons.ui.wiki, "contextMenu"),
      label: _loc("TERIOCK.SYSTEMS.Common.MENU.viewOnWiki"),
      onClick: () => application.document.system.wikiOpen(),
    });
  }
}

/**
 * @param {DocumentSheetV2} _application
 * @param {ApplicationHeaderControlsEntry[]} controls
 * @see {getHeaderControlsApplicationV2}
 */
function sortControls(_application, controls) {
  for (const c of controls) { c.label = _loc(c.label); }
  controls = game.i18n.sortObjects(controls, "label");
  controls.sort((a, b) => {
    const getOrder = control => {
      if (control.action === "attach") { return 1; }
      if (control.action === "detach") { return 2; }
      if (control.icon?.includes("delete")) { return 4; }
      return 3;
    };
    return getOrder(a) - getOrder(b);
  });
}

const applicationHookEntries = [
  ["getHeaderControlsBaseApplication", sortControls],
  ["getHeaderControlsDocumentSheetV2", addCardContextMenuEntriesToHeader],
  ["getHeaderControlsDocumentSheetV2", addWikiOpenToHeader],
  ["getHeaderControlsDocumentSheetV2", recolorCompendiumDocumentHeader],
  ["getHeaderControlsImagePopout", addShareImageToHeader],
  ["renderApplicationV2", addDeveloperModeLoggingListener],
  ["renderDocumentSheetV2", addIdentifierClipboardListener],
];

export default applicationHookEntries;
