import { TeriockHealManager } from "../api/_module.mjs";

/**
 * Show a healing dialog.
 * @param {TeriockActor} actor
 * @param {Teriock.Dialog.HealDialogOptions} [options]
 * @returns {Promise<void>}
 */
export default async function healDialog(actor, options = {}) {
  const healManager = new TeriockHealManager(actor, options);
  await healManager.render(true);
}
