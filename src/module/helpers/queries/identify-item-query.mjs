import { TeriockDialog } from "../../applications/api/_module.mjs";
import { selectDocumentsDialog } from "../../applications/dialogs/select-document-dialog.mjs";
import { makeIconClass } from "../utils.mjs";

const { ux } = foundry.applications;

/**
 * Query that asks the GM to identify the item.
 * @param {Teriock.QueryData.IdentifyItem} queryData
 * @param {{_timeout?: number}} timeout
 * @returns {Promise<boolean>}
 */
export default async function identifyItemQuery(queryData, { _timeout }) {
  const uuid = queryData.uuid;
  const item = await fromUuid(uuid);
  const content = await ux.TextEditor.implementation.enrichHTML(
    `<p>Should @UUID[${game.user.uuid}] identify @UUID[${item.uuid}]{${item.system.identification.name}}?</p>`,
  );
  const doIdentify = await TeriockDialog.confirm({
    content: content,
    modal: false,
    window: {
      icon: makeIconClass("magnifying-glass", "title"),
      title: "Identify Item",
    },
  });
  if (doIdentify) {
    const unrevealed = [
      ...item.getProperties().filter((p) => !p.system.revealed),
      ...item.getAbilities().filter((a) => !a.system.revealed),
      ...item.resources.filter((r) => !r.system.revealed),
      ...item.fluencies.filter((f) => !f.system.revealed),
    ];
    const toReveal = await selectDocumentsDialog(unrevealed, {
      hint: "Select effects to reveal.",
      tooltipAsync: false,
      checked: unrevealed.map((r) => r.uuid),
    });
    await item.updateEmbeddedDocuments(
      "ActiveEffect",
      toReveal.map((e) => {
        return {
          _id: e._id,
          "system.revealed": true,
        };
      }),
    );
    await item.update({
      "system.flaws": item.system.identification.flaws,
      "system.identification.flaws": "",
      "system.identification.identified": true,
      "system.identification.notes": "",
      "system.identification.read": true,
      "system.notes": item.system.identification.notes,
      "system.powerLevel": item.system.identification.powerLevel,
      name: item.system.identification.name,
    });
  }
  return doIdentify;
}
