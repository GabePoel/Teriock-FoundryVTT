import { makeIcon } from "../../../../helpers/utils.mjs";

const { ux } = foundry.applications;

/**
 * Connects embedded documents to their UI elements with context menus and event handlers.
 *
 * This function sets up context menus for embedded documents (items, effects, etc.) that appear
 * in card elements. It provides various actions like enable/disable, equip/unequip, attune/deattune,
 * and other document-specific operations based on the document type and current state.
 * @param {TeriockActor|TeriockEffect|TeriockItem} document - The parent document containing the embedded documents.
 * @param {HTMLElement} element - The DOM element containing the embedded document cards.
 */
export default function _connectEmbedded(document, element) {
  element.querySelectorAll(".tcard").forEach(/** @param {HTMLElement} el */(el) => {
    const id = el.getAttribute("data-id");
    const parentId = el.getAttribute("data-parent-id");
    /** @type {TeriockItem|TeriockEffect} */
    const embedded = document.items?.get(id) || document.effects?.get(id) || document.items?.get(parentId)
      ?.effects
      .get(id) || document.parent?.getEmbeddedDocument("ActiveEffect", id);
    if (embedded) {
      new ux.ContextMenu(el, ".tcard", embedded.system.cardContextMenuEntries, {
        eventName: "contextmenu",
        jQuery: false,
        fixed: true,
      });
      el.querySelectorAll("[data-action=\"useOneDoc\"]").forEach((actionEl) => {
        actionEl.addEventListener("contextmenu", (event) => {
          event.stopPropagation();
          embedded.system.gainOne();
        });
      });
    } else if (el.classList.contains("macro-card")) {
      new ux.ContextMenu(el, ".tcard", [
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
          condition: () => document.sheet.editable && document.isOwner && el.classList.contains("hooked-macro-card"),
          group: "document",
        },
      ], {
        eventName: "contextmenu",
        jQuery: false,
        fixed: true,
      });
    }
  });
}
