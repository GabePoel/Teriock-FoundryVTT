import { TeriockDialog } from "../../applications/api/_module.mjs";
import { selectDocumentsDialog } from "../../applications/dialogs/select-document-dialog.mjs";

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
    `<p>Should ${game.user.name} identify @UUID[${item.uuid}]{${item.name}}?</p>`,
  );
  const doIdentify = await TeriockDialog.confirm({
    content: content,
    modal: false,
    window: {
      icon: "fa-solid fa-magnifying-glass",
      title: "Identify Item",
    },
  });
  if (doIdentify) {
    const unrevealed = [
      ...item.properties.filter((p) => !p.system.revealed),
      ...item.abilities.filter((a) => !a.system.revealed),
      ...item.resources.filter((r) => !r.system.revealed),
      ...item.fluencies.filter((f) => !f.system.revealed),
    ];
    const toReveal = await selectDocumentsDialog(unrevealed, {
      hint: "Select effects to reveal.",
      tooltipAsync: false,
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
      name: item.system.identification.name,
      "system.notes": item.system.identification.notes,
      "system.identification.identified": true,
      "system.identification.read": true,
      "system.powerLevel": item.system.identification.powerLevel,
    });
  }
  return doIdentify;
}
