import { selectDocumentsDialog } from "./select-document-dialog.mjs";

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
  const selectedDocuments = await selectDocumentsDialog(visibleTokenDocuments, {
    title: options.title,
    hint: options.hint,
    tooltip: false,
    imgKey: "texture.src",
  });
  return selectedDocuments.map((d) => d.uuid);
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
