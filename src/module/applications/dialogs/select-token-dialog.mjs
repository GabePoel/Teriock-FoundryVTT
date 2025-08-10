import selectDocumentDialog from "./select-document-dialog.mjs";

const { DialogV2 } = foundry.applications.api;

/**
 * Select some number of visible tokens.
 *
 * @param {object} options
 * @param {string} options.[title] - Title for dialog.
 * @param {string} options.[hint] - Text for dialog.
 * @returns {Promise<Teriock.UUID<TeriockTokenDocument>[]>}
 */
export async function selectTokensDialog(
  options = { title: "Select Tokens", hint: "" },
) {
  const tokenLayer = /** @type {TokenLayer} */ game.canvas.tokens;
  const visibleTokenIds = tokenLayer.placeables
    .filter((t) => t.visible)
    .map((t) => t.id);
  const visibleTokenDocuments = [];
  for (const id of visibleTokenIds) {
    visibleTokenDocuments.push(tokenLayer.documentCollection.get(id));
  }
  const documents =
    /** @type {TeriockTokenDocument[]} */ visibleTokenDocuments.map((t) => {
      return {
        uuid: t.uuid,
        name: t.name,
        img: t.texture.src,
      };
    });
  return await selectDocumentDialog(documents, {
    title: options.title,
    hint: options.hint,
    multi: true,
    tooltip: false,
  });
}

/**
 * Select some number of visible tokens for target to be lighted to.
 *
 * @returns {Promise<Teriock.UUID<TeriockTokenDocument>[]>}
 */
export async function lightedToDialog() {
  return await selectTokensDialog({
    title: "Select Creatures",
    hint: "Select what creatures this effect makes its targets lighted to.",
  });
}

/**
 * Select some number of visible tokens for target to be goaded to.
 *
 * @returns {Promise<Teriock.UUID<TeriockTokenDocument>[]>}
 */
export async function goadedToDialog() {
  return await selectTokensDialog({
    title: "Select Creatures",
    hint: "Select what creatures this effect makes its targets goaded to.",
  });
}
