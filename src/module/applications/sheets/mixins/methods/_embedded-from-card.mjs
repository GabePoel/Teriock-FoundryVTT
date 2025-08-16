/**
 * Extracts an embedded document from a card element.
 *
 * @param {DocumentSheetV2} sheet
 * @param {HTMLElement} target - The target element to extract from.
 * @returns {Promise<TeriockItem|TeriockEffect|TeriockMacro|null>} The embedded document or null if not found.
 */
export default async function _embeddedFromCard(sheet, target) {
  /** @type {HTMLElement} */
  const card = target.closest(".tcard");
  const { id, type, parentId, uuid } = card?.dataset ?? {};

  if (type === "noneMacro") {
    foundry.ui.notifications.warn("Drag a macro onto sheet to assign it.", {
      console: false,
    });
  }

  if (type === "macro") return foundry.utils.fromUuid(id);

  if (type === "item") return sheet.document?.items.get(id);

  if (["effect", "conditionUnlocked"].includes(type)) {
    // TODO: Uncomment when virtual abilities are implemented
    // if (uuid) {
    //   return await foundry.utils.fromUuid(uuid);
    // }
    if (
      sheet.document.documentName === "Actor" &&
      sheet.document._id !== parentId
    ) {
      return sheet.document?.items.get(parentId)?.effects.get(id);
    }
    if (sheet.document.documentName === "ActiveEffect") {
      return sheet.document.parent?.effects.get(id);
    }
    return sheet.document?.effects.get(id);
  }

  if (type === "conditionLocked") {
    return CONFIG.TERIOCK.content.conditions[id];
  }
}
