import { TeriockHealManager } from "../api/_module.mjs";

export default async function healDialog(actor) {
  const healManager = new TeriockHealManager(actor);
  await healManager.render(true);
}