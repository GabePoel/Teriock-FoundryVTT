import { TeriockDialog } from "../../applications/api/_module.mjs";
import { DocumentSelector } from "../../applications/dialogs/_module.mjs";
import { TeriockTextEditor } from "../../applications/ux/_module.mjs";
import { buildWriteOperation, makeIconClass } from "../../utils/_module.mjs";

/**
 * Query that asks the GM to identify the item.
 * @param {Teriock.Queries.IdentifyItemData} queryData
 * @returns {Promise<boolean>}
 */
export default async function identifyItemQuery(queryData) {
  const item = await fromUuid(queryData.itemUuid);
  const user = await fromUuid(queryData.userUuid);
  if (!item || !user || item.system.identification.identified) { return false; }
  const content = await TeriockTextEditor.enrichHTML(
    _loc("TERIOCK.SYSTEMS.Equipment.QUERY.Identify.question", {
      item: `@UUID[${item.uuid}]{${item.system.identification.name}}`,
      user: user.link,
    }),
  );
  const doIdentify = user.isGM
    || await TeriockDialog.confirm({
      content,
      modal: false,
      window: {
        icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.equipment.identify, "title"),
        title: _loc("TERIOCK.SYSTEMS.Equipment.QUERY.Identify.title"),
      },
    });
  if (doIdentify) {
    const unrevealed = item.previewedTags.revealable.filter(c => !c.system.revealed);
    const toReveal = await DocumentSelector.selectMulti(unrevealed, {
      checked: unrevealed.map(r => r.uuid),
      hint: _loc("TERIOCK.SYSTEMS.Equipment.QUERY.Identify.hint"),
      noDocumentsMessage: _loc("TERIOCK.SYSTEMS.Equipment.QUERY.Identify.noDocumentsMessage"),
      silent: true,
    });
    if (!toReveal) { return false; }
    const revealOperation = item.getUpdateChildDocumentsOperation(
      "ActiveEffect",
      toReveal.map(e => {
        return { _id: e._id, "system.revealed": true };
      }),
    );
    const itemOperation = await buildWriteOperation({
      action: "update",
      docData: {
        name: item.system._source.identification.name,
        "system.identification.identified": true,
        "system.identification.read": true,
      },
      uuid: item.uuid,
    });
    await foundry.documents.modifyBatch([revealOperation, itemOperation].filter(Boolean));
  }
  return doIdentify;
}
