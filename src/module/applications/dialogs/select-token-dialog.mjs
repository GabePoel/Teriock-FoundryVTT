import { selectDocumentsDialog } from "./select-document-dialog.mjs";

/**
 * Select some number of visible tokens.
 * @param {object} options
 * @param {string} options.[title] - Title for dialog.
 * @param {string} options.[hint] - Text for dialog.
 * @returns {Promise<UUID<TeriockTokenDocument>[]>}
 */
export async function selectTokensDialog(options = {}) {
  options = foundry.utils.mergeObject(
    {
      title: "Select Tokens",
      hint: "",
    },
    options,
  );
  const tokenLayer = game.canvas.tokens;
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
 * Select some number of visible tokens for a target to have a condition associated with.
 * @param {Teriock.Parameters.Condition.ConditionKey} condition
 * @returns {Promise<UUID<TeriockTokenDocument>[]>}
 */
export async function conditionDialog(condition) {
  const conditionName = TERIOCK.index.conditions[condition];
  return await selectTokensDialog({
    title: "Select Creatures",
    hint: `The targets will be ${conditionName} with respect to the selected creatures.`,
  });
}
