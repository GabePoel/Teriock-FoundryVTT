import { TeriockDialog } from "../../applications/api/_module.mjs";
import { selectDocumentsDialog } from "../../applications/dialogs/select-document-dialog.mjs";
import { TeriockTextEditor } from "../../applications/ux/_module.mjs";
import { makeIconClass } from "../utils.mjs";

/**
 * Query that asks the GM to identify the item.
 * @param {Teriock.QueryData.IdentifyItem} queryData
 * @param {{_timeout?: number}} timeout
 * @returns {Promise<boolean>}
 */
export default async function identifyItemQuery(queryData, { _timeout }) {
  const uuid = queryData.uuid;
  const item = await fromUuid(uuid);
  const content = await TeriockTextEditor.enrichHTML(
    game.i18n.format("TERIOCK.MODELS.Identification.QUERY.Identify.question", {
      user: `@UUID[${game.user.uuid}]`,
      item: `@UUID[${this.parent.parent.uuid}]{${this.name}}`,
    }),
  );
  const doIdentify = await TeriockDialog.confirm({
    content: content,
    modal: false,
    window: {
      icon: makeIconClass(TERIOCK.display.icons.equipment.identify, "title"),
      title: game.i18n.localize(
        "TERIOCK.MODELS.Identification.QUERY.Identify.title",
      ),
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
      checked: unrevealed.map((r) => r.uuid),
      hint: game.i18n.localize(
        "TERIOCK.MODELS.Identification.QUERY.Identify.hint",
      ),
      silent: true,
      tooltipAsync: false,
      noDocumentsMessage: game.i18n.localize(
        "TERIOCK.MODELS.Identification.QUERY.Identify.noDocumentsMessage",
      ),
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
