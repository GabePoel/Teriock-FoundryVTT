import { TeriockRevitalizeManager } from "../api/_module.mjs";

/**
 * Show a revitalizing dialog.
 * @param {TeriockActor} actor
 * @param {Teriock.Dialog.StatDialogOptions} [options]
 * @returns {Promise<void>}
 */
export default async function revitalizeDialog(actor, options = {}) {
  const revitalizeManager = new TeriockRevitalizeManager(actor, options);
  await revitalizeManager.render(true);
}
