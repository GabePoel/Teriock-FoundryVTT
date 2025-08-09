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
  element.querySelectorAll(".tcard").forEach((el) => {
    const id = el.getAttribute("data-id");
    const parentId = el.getAttribute("data-parent-id");
    /** @type {TeriockItem|TeriockEffect} */
    const embedded =
      document.items?.get(id) ||
      document.effects?.get(id) ||
      document.items?.get(parentId)?.effects.get(id) ||
      document.parent?.getEmbeddedDocument("ActiveEffect", id);
    if (embedded) {
      new ux.ContextMenu(el, ".tcard", embedded.system.cardContextMenuEntries, {
        eventName: "contextmenu",
        jQuery: false,
        fixed: true,
      });
      el.querySelectorAll('[data-action="useOneDoc"]').forEach((actionEl) => {
        actionEl.addEventListener("contextmenu", (event) => {
          event.stopPropagation();
          embedded.system.gainOne();
        });
      });
    }
  });
}
