import { selectDialog } from "./select-dialog.mjs";

// TODO: Convert to document selection.

/**
 * Dialog that lets you select a {@link TeriockEffect} to activate on use of a {@link TeriockItem}.
 * @param {TeriockItem} item
 * @returns {Promise<null|Teriock.ID<TeriockEffect>>}
 */
export async function onUseDialog(item) {
  const choices = {};
  const onUseIds = item.system.onUse;
  for (const id of onUseIds) {
    const effect = item.effects.get(id);
    if (effect) {
      choices[effect.id] = effect.name;
    }
  }
  if (Object.keys(choices).length === 0) return null;
  return await selectDialog(choices, {
    label: "Ability",
    hint: `${item.name} has abilities that can activate on use. You may select one to activate.`,
    title: "Activate Ability",
  });
}
