import { TeriockDialog } from "../../applications/api/_module.mjs";
import { DocumentSelector } from "../../applications/dialogs/_module.mjs";
import { TeriockTextEditor } from "../../applications/ux/_module.mjs";
import { makeIconClass } from "../icon.mjs";
import { buildWriteOperation } from "../utils.mjs";

/**
 * Query that asks the GM to identify the item.
 * @param {Teriock.Queries.IdentifyItemData} queryData
 * @returns {Promise<boolean>}
 */
export default async function identifyItemQuery(queryData) {
  const uuid = queryData.uuid;
  const item = await fromUuid(uuid);
  const content = await TeriockTextEditor.enrichHTML(
    _loc("TERIOCK.MODELS.Identification.QUERY.Identify.question", {
      item: `@UUID[${item.uuid}]{${item.system.identification.name}}`,
      user: game.user.link,
    }),
  );
  const doIdentify = await TeriockDialog.confirm({
    content,
    modal: false,
    window: {
      icon: makeIconClass(TERIOCK.display.icons.equipment.identify, "title"),
      title: _loc("TERIOCK.MODELS.Identification.QUERY.Identify.title"),
    },
  });
  if (doIdentify) {
    const unrevealed = [
      ...item.properties.filter(p => !p.system.revealed),
      ...item.abilities.filter(a => !a.system.revealed),
      ...item.resources.filter(r => !r.system.revealed),
      ...item.fluencies.filter(f => !f.system.revealed),
    ];
    const toReveal = await DocumentSelector.selectMulti(unrevealed, {
      checked: unrevealed.map(r => r.uuid),
      hint: _loc("TERIOCK.MODELS.Identification.QUERY.Identify.hint"),
      noDocumentsMessage: _loc("TERIOCK.MODELS.Identification.QUERY.Identify.noDocumentsMessage"),
      silent: true,
    });
    const revealOperation = item.getUpdateChildDocumentsOperation(
      "ActiveEffect",
      toReveal.map(e => {
        return { _id: e._id, "system.revealed": true };
      }),
    );
    const itemOperation = await buildWriteOperation({
      action: "update",
      docData: {
        name: item.system.identification.name,
        "system.flaws": item.system.identification.flaws,
        "system.identification.flaws": "",
        "system.identification.identified": true,
        "system.identification.notes": "",
        "system.identification.read": true,
        "system.notes": item.system.identification.notes,
        "system.powerLevel": item.system.identification.powerLevel,
      },
      uuid: item.uuid,
    });
    await foundry.documents.modifyBatch([revealOperation, itemOperation].filter(Boolean));
  }
  return doIdentify;
}
