import { makeIcon } from "../../../../../helpers/utils.mjs";
import { TeriockContextMenu } from "../../../../ux/_module.mjs";

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
  cards.forEach(
    /** @param {HTMLElement} target */ (target) => {
      if (target.classList.contains("macro-card")) {
        new TeriockContextMenu(
          target,
          ".tcard",
          [
            {
              name: "Unlink",
              icon: makeIcon("link-slash", "contextMenu"),
              callback: async () => {
                const uuidElement =
                  /** @type {HTMLElement} */ target.closest("[data-uuid]");
                const uuid = uuidElement.dataset.uuid;
                await document.system.unlinkMacro(uuid);
              },
              condition: () => document.sheet.editable && document.isOwner,
              group: "document",
            },
            {
              name: "Change Run Hook",
              icon: makeIcon("gear-code", "contextMenu"),
              callback: async () => {
                const uuidElement =
                  /** @type {HTMLElement} */ target.closest("[data-uuid]");
                const uuid = uuidElement.dataset.uuid;
                await document.system.changeMacroRunHook(uuid);
              },
              condition: () =>
                document.sheet.editable &&
                document.isOwner &&
                target.classList.contains("hooked-macro-card"),
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
  );
}
