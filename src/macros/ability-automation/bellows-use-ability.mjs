const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const dealsDamage = data.execution.message?.system.buttons.some(
  (b) =>
    b.dataset.action === "roll-rollable-take" && b.dataset.type === "damage",
);
if (data.execution.source.system.spell && dealsDamage) {
  const bellowsIds = data.execution.actor?.effects
    .filter((c) => c.name === "Bellows Effect" && c.type === "consequence")
    .map((c) => c.id);
  if (bellowsIds && bellowsIds.length > 0) {
    await data.execution.actor?.deleteEmbeddedDocuments(
      "ActiveEffect",
      bellowsIds,
    );
  }
}
