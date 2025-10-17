import { makeIcon } from "../../../../../helpers/utils.mjs";
import _embeddedFromCard from "./_embedded-from-card.mjs";

const { ux } = foundry.applications;

/**
 * Connects embedded documents to their UI elements with context menus and event handlers.
 *
 * This function sets up context menus for embedded documents (items, effects, etc.) that appear
 * in card elements. It provides various actions like enable/disable, equip/unequip, attune/deattune,
 * and other document-specific operations based on the document type and current state.
 * @param {TeriockCommon} document - The parent document containing the embedded documents.
 * @param {HTMLElement} element - The DOM element containing the embedded document cards.
 * @returns {Promise<void>}
 */
export default async function _connectEmbedded(document, element) {
  const cards = element.querySelectorAll(".tcard");

  await Promise.all(
    Array.from(cards).map(
      /** @param {HTMLElement} el */ async (el) => {
        const embedded = await _embeddedFromCard(document.sheet, el);
        if (
          embedded &&
          ["Item", "ActiveEffect"].includes(embedded.documentName)
        ) {
          new ux.ContextMenu(
            el,
            ".tcard",
            embedded.system.cardContextMenuEntries,
            {
              eventName: "contextmenu",
              jQuery: false,
              fixed: true,
            },
          );

          el.querySelectorAll('[data-action="useOneDoc"]').forEach(
            (actionEl) => {
              actionEl.addEventListener("contextmenu", (event) => {
                event.stopPropagation();
                embedded.system.gainOne();
              });
            },
          );
        } else if (el.classList.contains("macro-card")) {
          new ux.ContextMenu(
            el,
            ".tcard",
            [
              {
                name: "Unlink",
                icon: makeIcon("link-slash", "contextMenu"),
                callback: async () => {
                  const uuid = el.dataset.id;
                  await document.system.unlinkMacro(uuid);
                },
                condition: () => document.sheet.editable && document.isOwner,
                group: "document",
              },
              {
                name: "Change Run Hook",
                icon: makeIcon("gear-code", "contextMenu"),
                callback: async () => {
                  const uuid = el.dataset.id;
                  await document.system.changeMacroRunHook(uuid);
                },
                condition: () =>
                  document.sheet.editable &&
                  document.isOwner &&
                  el.classList.contains("hooked-macro-card"),
                group: "document",
              },
            ],
            {
              eventName: "contextmenu",
              jQuery: false,
              fixed: true,
            },
          );
        }
      },
    ),
  );
}
