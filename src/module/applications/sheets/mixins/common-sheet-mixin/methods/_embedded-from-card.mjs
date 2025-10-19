/**
 * Extracts an embedded document from a card element.
 * @param {DocumentSheetV2} sheet
 * @param {HTMLElement} target - The target element to extract from.
 * @returns {Promise<TeriockItem|TeriockEffect|TeriockMacro|null>} The embedded document or null if not found.
 */
export default async function _embeddedFromCard(sheet, target) {
  /** @type {HTMLElement} */
  let card = target;
  if (!target.classList.contains(".tcard")) {
    card = target.closest(".tcard");
  }
  const { id, type, parentId, uuid } = card?.dataset ?? {};
  if (type === "noneMacro") {
    foundry.ui.notifications.warn("Drag a macro onto sheet to assign it.", {
      console: false,
    });
  } else if (type === "macro") {
    return foundry.utils.fromUuid(id);
  } else if (type === "item") {
    return sheet.document?.items.get(id);
  } else if (["effect", "conditionUnlocked"].includes(type)) {
    if (
      sheet.document.documentName === "Actor" &&
      sheet.document._id !== parentId
    ) {
      let embedded = sheet.document?.items.get(parentId)?.effects.get(id);
      if (embedded) {
        return embedded;
      } else {
        return await fromUuid(uuid);
      }
    }
    if (sheet.document.documentName === "ActiveEffect") {
      return sheet.document.parent?.effects.get(id);
    }
    return sheet.document?.effects.get(id);
  } else if (type === "conditionLocked") {
    return TERIOCK.data.conditions[id];
  }
}
