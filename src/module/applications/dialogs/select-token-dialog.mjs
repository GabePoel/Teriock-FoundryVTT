const { DialogV2 } = foundry.applications.api;

/**
 * Select some number of visible tokens.
 *
 * @param {object} options
 * @param {string} options.[title] - Title for dialog.
 * @param {string} options.[hint] - Text for dialog.
 * @returns {Promise<Teriock.UUID<TeriockTokenDocument>>}
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
  const context = { tokens: {}, hint: options.hint };
  for (const tokenDocument of visibleTokenDocuments) {
    context.tokens[tokenDocument.uuid] = {
      name: tokenDocument.name,
      img: tokenDocument.texture.src,
    };
  }
  const content = await foundry.applications.handlebars.renderTemplate(
    "systems/teriock/src/templates/dialog-templates/token-select.hbs",
    context,
  );
  return await DialogV2.prompt({
    window: { title: options.title },
    content: content,
    ok: {
      callback: (_event, button) =>
        Array.from(button.form.elements)
          .filter((e) => e?.checked)
          .map((e) => e?.name),
    },
  });
}

/**
 * Select some number of visible tokens for target to be lighted to.
 *
 * @returns {Promise<Teriock.UUID<TeriockTokenDocument>>}
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
 * @returns {Promise<Teriock.UUID<TeriockTokenDocument>>}
 */
export async function goadedToDialog() {
  return await selectTokensDialog({
    title: "Select Creatures",
    hint: "Select what creatures this effect makes its targets goaded to.",
  });
}
