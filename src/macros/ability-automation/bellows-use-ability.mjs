const dealsDamage = scope.execution.message?.system.buttons.some(
  (b) =>
    b.dataset.action === "roll-rollable-take" && b.dataset.type === "damage",
);
if (scope.execution.source.system.spell && dealsDamage) {
  const bellowsIds = scope.execution.actor?.effects
    .filter((c) => c.name === "Bellows Effect" && c.type === "consequence")
    .map((c) => c.id);
  if (bellowsIds && bellowsIds.length > 0) {
    await scope.execution.actor?.deleteEmbeddedDocuments(
      "ActiveEffect",
      bellowsIds,
    );
  }
}
