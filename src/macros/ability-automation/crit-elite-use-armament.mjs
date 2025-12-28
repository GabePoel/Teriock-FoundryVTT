const data = /** @type {Teriock.HookData.UseArmament} */ scope.data;
const critEliteIds = data.execution.actor?.effects
  .filter((c) => c.name === "Crit Elite Effect" && c.type === "consequence")
  .map((c) => c.id);
if (critEliteIds && critEliteIds.length > 0) {
  await data.execution.actor?.deleteEmbeddedDocuments(
    "ActiveEffect",
    critEliteIds,
  );
}
