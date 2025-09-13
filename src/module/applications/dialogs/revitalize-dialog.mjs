import { TeriockRevitalizeManager } from "../api/_module.mjs";

export default async function revitalizeDialog(actor) {
  const revitalizeManager = new TeriockRevitalizeManager(actor);
  await revitalizeManager.render(true);
}