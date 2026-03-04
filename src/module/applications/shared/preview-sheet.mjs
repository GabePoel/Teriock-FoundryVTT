/**
 * Preview a document's sheet even if you aren't the owner of it.
 * @param {AnyChildDocument} doc
 */
export default async function previewSheet(doc) {
  if (doc.isOwner) {
    await doc.sheet.render(true);
  } else {
    let root = doc;
    if (doc.documentName === "ActiveEffect") root = doc.parent;
    const rootData = root.toObject();
    rootData.ownership = { [game.user.id]: 1 };
    assignRealUuid(rootData, root);
    const RootClass = foundry.utils.getDocumentClass(root.documentName);
    const rootDoc = new RootClass.implementation(rootData);
    if (doc.documentName === "ActiveEffect") {
      await rootDoc.effects.get(doc.id).sheet.render(true);
    } else {
      await rootDoc.sheet.render(true);
    }
  }
}

/**
 * Assign UUID flags to document and embeds.
 * @param {object} docData
 * @param {ChildDocument} doc
 */
function assignRealUuid(docData, doc) {
  if (!docData.flags) docData.flags = {};
  if (!docData.flags.teriock) docData.flags.teriock = {};
  docData.flags.teriock["previewUuid"] = doc.uuid;
  if (docData.effects) {
    for (const effect of docData.effects) {
      assignRealUuid(effect, doc.effects.get(effect._id));
    }
  }
}
